// src/lib/serverGameLogic.ts

import prisma from "@/lib/prisma";
// import { playAITurn } from "./serverAIPlayer";
import {
  GameState,
  Domino,
  PlayerWithHand,
  GameWithState,
  Player,
  GamePhase,
  DominoState,
} from "../types/gameTypes";
import { shuffleDominoes, dealDominoes } from "@/utils/dominoUtils";

// Temporary AI turn handler until we implement the proper one
async function playAITurn(gameId: string, playerId: string) {
  console.log(`AI Turn for game ${gameId}, player ${playerId} - Stub implementation`);
  return;
}

export async function initializeGame(gameId: string) {
  console.log(`ServerGameLogic: Initializing game ${gameId}`);
  
  try {
    const game = await prisma.game.findFirst({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      console.error(`Game not found with ID: ${gameId}`);
      throw new Error("Game not found");
    }

    console.log(`Found game with ${game.players.length} players`);
    
    // Generate dominoes and deal to players
    const dominoes = shuffleDominoes();
    const playerHands = dealDominoes(dominoes);
    console.log(`Generated ${dominoes.length} dominoes, dealt to ${playerHands.length} hands`);

    // Find the player with double-six who will start
    const startingPlayerIndex = playerHands.findIndex((hand) =>
      hand.some((domino) => domino.leftPips === 6 && domino.rightPips === 6)
    );
    
    if (startingPlayerIndex === -1) {
      console.log("No player has double-six, reshuffling...");
      // If no player has the double six, reshuffle and deal again
      return initializeGame(gameId);
    }
    
    console.log(`Player ${startingPlayerIndex} will start with double-six`);

    // Create player objects with their hands
    const players: Player[] = game.players.map((player, index) => ({
      id: index,
      name: `Player ${index + 1}`,
      dominoes: playerHands[index],
      isAI: player.isAI ?? false,
    }));

    console.log("Updating players with their hands in database...");
    
    // Update players in database with their hands
    await Promise.all(
      game.players.map((player, index) =>
        prisma.player.update({
          where: { id: player.id },
          data: { hand: JSON.stringify(playerHands[index]) },
        })
      )
    );

    console.log("Creating initial game state...");
    
    // Create initial game state
    const initialGameState: GameState = {
      players,
      currentPlayer: startingPlayerIndex,
      dominoes,
      dominoChain: [],
      gameStarted: true,
      roundWinner: null,
      tournamentScores: [0, 0, 0, 0],
      gamePhase: GamePhase.Play,
      passCount: 0,
      roundEnded: false,
      double6Played: false,
      startingPlayerId: startingPlayerIndex,
      leftEnd: -1,
      rightEnd: -1,
    };

    console.log("Updating game with initial state in database...");
    
    // Update game in database with initial state
    await prisma.game.update({
      where: { id: gameId },
      data: { gameState: JSON.stringify(initialGameState) },
    });

    console.log("Game initialization complete");
    
    return {
      game,
      playerHands,
      dominoes,
      startingPlayerIndex,
    };
  } catch (error) {
    console.error("Error in initializeGame:", error);
    throw error;
  }
}

export async function playDomino(
  gameId: string,
  playerId: string,
  dominoIndex: number,
  end: "left" | "right" | "any"
) {
  console.log(`ServerGameLogic: Playing domino for game ${gameId}, player ${playerId}, index ${dominoIndex}, end ${end}`);
  
  try {
    // Fetch the game and related data
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      console.error(`Game not found with ID: ${gameId}`);
      throw new Error("Game not found");
    }

    console.log(`Found game, status: ${game.status}`);
    
    if (!game.gameState) {
      console.error("Game state is missing");
      throw new Error("Game state is missing");
    }

    // Parse game state
    const gameState: GameState = JSON.parse(game.gameState);
    console.log(`Current player: ${gameState.currentPlayer}, Chain length: ${gameState.dominoChain.length}`);

    // Find the player
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
      console.error(`Player ${playerId} not found in game ${gameId}`);
      throw new Error("Player not found in game");
    }

    if (!player.hand) {
      console.error(`Player ${playerId} has no hand`);
      throw new Error("Player has no hand");
    }

    // Parse player's hand
    const playerHand: Domino[] = JSON.parse(player.hand);
    console.log(`Player has ${playerHand.length} dominoes in hand`);

    // Validate it's the player's turn
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex !== gameState.currentPlayer) {
      console.error(`Not player's turn. Current: ${gameState.currentPlayer}, Attempted: ${playerIndex}`);
      throw new Error("Not your turn");
    }

    // Check if the domino index is valid
    if (dominoIndex < 0 || dominoIndex >= playerHand.length) {
      console.error(`Invalid domino index ${dominoIndex}, hand size is ${playerHand.length}`);
      throw new Error("Invalid domino index");
    }

    // Get the domino being played
    const domino = playerHand[dominoIndex];
    console.log(`Playing domino: Left ${domino.leftPips}, Right ${domino.rightPips}`);

    // Validate the move
    if (!isValidMove(domino, gameState.dominoChain, end)) {
      console.error("Invalid move: domino doesn't match the chain");
      throw new Error("Invalid move");
    }

    // Create a copy of the game state to update
    const updatedGameState = { ...gameState };

    // Remove the domino from the player's hand
    const updatedPlayerHand = [...playerHand];
    updatedPlayerHand.splice(dominoIndex, 1);

    // Update the player's hand in the game state and database
    updatedGameState.players[playerIndex].dominoes = updatedPlayerHand;
    
    console.log(`Updating player's hand in database, new hand size: ${updatedPlayerHand.length}`);
    await prisma.player.update({
      where: { id: playerId },
      data: { hand: JSON.stringify(updatedPlayerHand) },
    });

    // Add the domino to the chain
    const updatedChain = [...gameState.dominoChain];
    
    // Determine correct orientation and end placement
    if (updatedChain.length === 0) {
      // First domino in the chain
      console.log("Adding first domino to chain");
      
      const position: [number, number, number] = [0, 0, 0];
      const rotation: [number, number, number] = [
        Math.PI / 2, 
        domino.leftPips === domino.rightPips ? Math.PI / 2 : 0, 
        0
      ];
      
      updatedChain.push({
        ...domino,
        position,
        rotation
      });
      
      updatedGameState.leftEnd = domino.leftPips;
      updatedGameState.rightEnd = domino.rightPips;
    } else {
      // Not the first domino
      console.log(`Adding domino to ${end} of chain`);
      
      // Calculate position and rotation (simplified here)
      const position: [number, number, number] = [0, 0, 0];
      const rotation: [number, number, number] = [Math.PI / 2, 0, 0];
      
      // Prepare the domino with correct orientation based on end
      const preparedDomino = { ...domino, position, rotation };
      
      if (end === "left" || end === "any" && updatedChain.length === 0) {
        updatedChain.unshift(preparedDomino);
        updatedGameState.leftEnd = domino.leftPips === updatedGameState.leftEnd ? 
          domino.rightPips : domino.leftPips;
      } else {
        updatedChain.push(preparedDomino);
        updatedGameState.rightEnd = domino.rightPips === updatedGameState.rightEnd ? 
          domino.leftPips : domino.rightPips;
      }
    }
    
    updatedGameState.dominoChain = updatedChain;
    
    // Check if player has won
    if (updatedPlayerHand.length === 0) {
      console.log(`Player ${playerId} has won the round!`);
      updatedGameState.roundEnded = true;
      updatedGameState.roundWinner = playerIndex;
      
      // Update game status
      await prisma.game.update({
        where: { id: gameId },
        data: { status: "completed" },
      });
    } else {
      // Move to next player
      updatedGameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
      updatedGameState.passCount = 0;
      console.log(`Next player: ${updatedGameState.currentPlayer}`);
    }
    
    // Update game state in database
    console.log("Updating game state in database");
    await updateGameState(gameId, updatedGameState);
    
    // Trigger AI turn if next player is AI
    if (!updatedGameState.roundEnded && 
        updatedGameState.players[updatedGameState.currentPlayer].isAI) {
      console.log("Triggering AI turn");
      // Get the AI player ID
      const aiPlayerId = game.players[updatedGameState.currentPlayer].id;
      await playAITurn(gameId, aiPlayerId);
    }
    
    return {
      success: true,
      gameState: updatedGameState,
    };
  } catch (error) {
    console.error("Error in playDomino:", error);
    throw error;
  }
}

function isValidMove(
  domino: Domino,
  chain: Domino[],
  end: "left" | "right" | "any"
): boolean {
  // First domino is always valid
  if (chain.length === 0) {
    // Traditional rules: first domino must be double-six
    return domino.leftPips === 6 && domino.rightPips === 6;
  }

  // Check based on which end we're placing
  if (end === "left" || end === "any") {
    const leftEnd = chain[0].leftPips;
    return domino.leftPips === leftEnd || domino.rightPips === leftEnd;
  }

  if (end === "right" || end === "any") {
    const rightEnd = chain[chain.length - 1].rightPips;
    return domino.leftPips === rightEnd || domino.rightPips === rightEnd;
  }

  return false;
}

async function updateGameState(gameId: string, updatedGameState: GameState) {
  console.log(`ServerGameLogic: Updating game state for game ${gameId}`);
  
  try {
    await prisma.game.update({
      where: { id: gameId },
      data: {
        gameState: JSON.stringify(updatedGameState),
      },
    });
    console.log("Game state updated successfully");
  } catch (error) {
    console.error("Error updating game state:", error);
    throw error;
  }
}

export const passTurn = async (gameId: string, playerId: string) => {
  console.log(`ServerGameLogic: Passing turn for game ${gameId}, player ${playerId}`);
  
  try {
    const game = await prisma.game.findFirst({
      where: { id: gameId },
      include: { players: true },
    });
    
    if (!game) {
      console.error(`Game not found with ID: ${gameId}`);
      throw new Error("Game not found");
    }

    if (!game.gameState) {
      console.error("Game state is missing");
      throw new Error("Game state is missing");
    }

    // Parse game state
    const gameState: GameState = JSON.parse(game.gameState);
    console.log(`Current player: ${gameState.currentPlayer}, Pass count: ${gameState.passCount}`);

    // Ensure it's the player's turn
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex !== gameState.currentPlayer) {
      console.error(`Not player's turn. Current: ${gameState.currentPlayer}, Attempted: ${playerIndex}`);
      throw new Error("Not your turn");
    }

    // Update game state
    const nextPlayerIndex = (gameState.currentPlayer + 1) % gameState.players.length;
    const updatedGameState: GameState = {
      ...gameState,
      currentPlayer: nextPlayerIndex,
      passCount: (gameState.passCount || 0) + 1,
    };

    // Check if all players have passed
    if (updatedGameState.passCount >= gameState.players.length) {
      console.log("All players have passed, game is blocked");
      
      // Game is blocked, determine winner
      updatedGameState.roundEnded = true;
      updatedGameState.roundWinner = findWinnerOfBlockedGame(gameState.players);
      console.log(`Round ended due to block. Winner: Player ${updatedGameState.roundWinner}`);
      
      // Update game status
      await prisma.game.update({
        where: { id: gameId },
        data: { status: "blocked" },
      });
    }

    // Update game state in database
    console.log("Updating game state in database");
    await updateGameState(gameId, updatedGameState);

    // Trigger AI turn if next player is AI
    if (!updatedGameState.roundEnded && 
        updatedGameState.players[nextPlayerIndex].isAI) {
      console.log("Triggering AI turn");
      // Get the AI player ID
      const aiPlayerId = game.players[nextPlayerIndex].id;
      await playAITurn(gameId, aiPlayerId);
    }

    return {
      success: true,
      gameState: updatedGameState,
    };
  } catch (error) {
    console.error("Error in passTurn:", error);
    throw error;
  }
};

function findWinnerOfBlockedGame(players: Player[]): number {
  console.log("Finding winner of blocked game");
  
  let minPips = Infinity;
  let winnerIndex = 0;

  players.forEach((player, index) => {
    const totalPips = player.dominoes.reduce(
      (sum: number, domino: Domino) =>
        sum + domino.leftPips + domino.rightPips,
      0
    );
    
    console.log(`Player ${index} has ${totalPips} total pips`);
    
    if (totalPips < minPips) {
      minPips = totalPips;
      winnerIndex = index;
    }
  });
  
  console.log(`Winner is player ${winnerIndex} with ${minPips} pips`);
  return winnerIndex;
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { isValidDominoChain } from "@/utils/validateDominoChain";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  // Require authentication
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  try {
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    const { gameId, move, dominoIndex, end } = data;
    
    if (!gameId || !move) {
      return NextResponse.json(
        { error: "Game ID and move type are required" },
        { status: 400 }
      );
    }
    
    // Find the game and the player
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true,
      },
    });
    
    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }
    
    // Parse game state
    let gameState;
    try {
      gameState = game.gameState ? JSON.parse(game.gameState) : null;
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid game state" },
        { status: 500 }
      );
    }
    
    if (!gameState) {
      return NextResponse.json(
        { error: "Game state not found" },
        { status: 500 }
      );
    }
    
    // Get the current player
    const currentPlayerIndex = gameState.currentPlayer;
    const currentPlayer = game.players[currentPlayerIndex];
    
    // Check if it's the user's turn
    if (currentPlayer.userId !== user.id) {
      return NextResponse.json(
        { error: "It's not your turn" },
        { status: 403 }
      );
    }
    
    // Parse the player's hand
    let hand = [];
    try {
      hand = currentPlayer.hand ? JSON.parse(currentPlayer.hand) : [];
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid player hand" },
        { status: 500 }
      );
    }
    
    // Process the move based on type
    let updatedGameState = { ...gameState };
    let updatedHand = [...hand];
    
    switch (move) {
      case "playDomino":
        if (dominoIndex === undefined || !end) {
          return NextResponse.json(
            { error: "Domino index and placement end are required" },
            { status: 400 }
          );
        }
        
        // Get the domino from the player's hand
        const domino = hand[dominoIndex];
        if (!domino) {
          return NextResponse.json(
            { error: "Invalid domino index" },
            { status: 400 }
          );
        }
        
        // Validate the move
        // In a real implementation, add proper validation here
        
        // Update the chain and remove domino from hand
        let updatedChain = [...(gameState.dominoChain || [])];
        
        // Prepare the domino for placement (position, rotation)
        // In a real implementation, calculate proper positions
        const preparedDomino = {
          ...domino,
          position: [0, 0, 0],
          rotation: [Math.PI / 2, 0, 0],
        };
        
        // Add to the chain based on the specified end
        if (end === "left") {
          updatedChain.unshift(preparedDomino);
        } else {
          updatedChain.push(preparedDomino);
        }
        
        // Verify chain validity
        if (!isValidDominoChain(updatedChain)) {
          return NextResponse.json(
            { error: "Invalid domino placement" },
            { status: 400 }
          );
        }
        
        // Remove domino from hand
        updatedHand = hand.filter((_, idx) => idx !== dominoIndex);
        
        // Update game state
        updatedGameState = {
          ...gameState,
          dominoChain: updatedChain,
          currentPlayer: (currentPlayerIndex + 1) % game.players.length,
          passCount: 0,
        };
        
        break;
        
      case "pass":
        // Update game state - move to next player
        updatedGameState = {
          ...gameState,
          currentPlayer: (currentPlayerIndex + 1) % game.players.length,
          passCount: (gameState.passCount || 0) + 1,
        };
        
        // Check if all players have passed
        if (updatedGameState.passCount >= game.players.length) {
          updatedGameState.gamePhase = "end";
          
          // Calculate scores
          // In a real implementation, determine the winner
        }
        
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid move type" },
          { status: 400 }
        );
    }
    
    // Update player's hand in the database
    await prisma.player.update({
      where: { id: currentPlayer.id },
      data: {
        hand: JSON.stringify(updatedHand),
      },
    });
    
    // Update game state in the database
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        gameState: JSON.stringify(updatedGameState),
        // If the game is over, update status
        status: updatedGameState.gamePhase === "end" ? "completed" : game.status,
      },
      include: {
        players: true,
      },
    });
    
    // Format response - parse hands and game state
    const formattedPlayers = updatedGame.players.map(player => {
      let parsedHand;
      try {
        parsedHand = player.hand ? JSON.parse(player.hand) : [];
      } catch (e) {
        parsedHand = [];
      }
      
      return {
        ...player,
        hand: parsedHand,
      };
    });
    
    return NextResponse.json({
      ...updatedGame,
      gameState: updatedGameState,
      players: formattedPlayers,
    });
  } catch (error) {
    console.error("Error in POST /api/game/move:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
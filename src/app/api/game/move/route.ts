import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// Mock database for game state (in a real app, this would be a database)
// We reference the same games array defined in the main game API route
// In a real application, this would be a database access
declare const games: any[];

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  // Require authentication
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const data = await request.json();
    const { gameId, move, dominoIndex, end } = data;
    
    if (!gameId || !move) {
      return NextResponse.json(
        { error: "Game ID and move type are required" },
        { status: 400 }
      );
    }
    
    // Find the game
    const gameIndex = games.findIndex((g) => g.id === gameId);
    if (gameIndex === -1) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    
    const game = games[gameIndex];
    
    // Check if it's the user's turn
    const currentPlayerIndex = game.currentPlayer;
    const currentPlayer = game.players[currentPlayerIndex];
    
    if (currentPlayer.id !== session.user.id) {
      return NextResponse.json(
        { error: "It's not your turn" },
        { status: 403 }
      );
    }
    
    // Process the move based on type
    let updatedGame = { ...game };
    
    switch (move) {
      case "playDomino":
        if (dominoIndex === undefined || !end) {
          return NextResponse.json(
            { error: "Domino index and placement end are required" },
            { status: 400 }
          );
        }
        
        // Get the domino from the player's hand
        const domino = currentPlayer.dominoes[dominoIndex];
        if (!domino) {
          return NextResponse.json(
            { error: "Invalid domino index" },
            { status: 400 }
          );
        }
        
        // In a real implementation, we would:
        // 1. Validate the move based on game rules
        // 2. Update the dominoChain
        // 3. Remove the domino from the player's hand
        // 4. Update game state (next player, etc.)
        
        // For this simplified version, just remove the domino from the player's hand
        // and add it to the chain
        const updatedPlayers = [...game.players];
        updatedPlayers[currentPlayerIndex] = {
          ...currentPlayer,
          dominoes: currentPlayer.dominoes.filter((_, idx) => idx !== dominoIndex),
        };
        
        // Update the domino chain
        const updatedChain = [...game.dominoChain];
        if (end === "left") {
          updatedChain.unshift({
            ...domino,
            position: [0, 0, 0], // This would be calculated properly in real implementation
            rotation: [Math.PI / 2, 0, 0],
          });
        } else {
          updatedChain.push({
            ...domino,
            position: [0, 0, 0], // This would be calculated properly in real implementation
            rotation: [Math.PI / 2, 0, 0],
          });
        }
        
        // Update the game
        updatedGame = {
          ...game,
          players: updatedPlayers,
          dominoChain: updatedChain,
          currentPlayer: (currentPlayerIndex + 1) % game.players.length,
          // Update other state as needed
        };
        break;
        
      case "pass":
        // Move to the next player
        updatedGame = {
          ...game,
          currentPlayer: (currentPlayerIndex + 1) % game.players.length,
          passCount: (game.passCount || 0) + 1,
        };
        
        // Check if all players have passed
        if (updatedGame.passCount >= game.players.length) {
          updatedGame.status = "finished";
          updatedGame.result = "blocked";
          // Calculate scores, etc.
        }
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid move type" },
          { status: 400 }
        );
    }
    
    // Update the game in the "database"
    games[gameIndex] = updatedGame;
    
    return NextResponse.json(updatedGame);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
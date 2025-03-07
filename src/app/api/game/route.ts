import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// Mock database for game state (in a real app, this would be a database)
let games: any[] = [];

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  // Require authentication
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  // Get game ID from query parameter
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("id");
  
  if (gameId) {
    // Return specific game
    const game = games.find((g) => g.id === gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    return NextResponse.json(game);
  }
  
  // Return list of games for the user
  const userGames = games.filter(
    (game) => game.players.some((p: any) => p.id === session.user.id)
  );
  
  return NextResponse.json(userGames);
}

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
    
    // Create a new game with the user as the host
    const newGame = {
      id: `game_${Date.now()}`,
      createdAt: new Date().toISOString(),
      hostId: session.user.id,
      status: "waiting", // waiting, playing, finished
      players: [
        {
          id: session.user.id,
          name: session.user.name || "Player 1",
          dominoes: [],
          isAI: false,
        },
        // Add AI players by default
        { id: "ai-1", name: "AI Player 1", dominoes: [], isAI: true },
        { id: "ai-2", name: "AI Player 2", dominoes: [], isAI: true },
        { id: "ai-3", name: "AI Player 3", dominoes: [], isAI: true },
      ],
      ...data,
    };
    
    games.push(newGame);
    
    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { gameId } = data;
    
    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }
    
    // Find the game
    const gameIndex = games.findIndex((g) => g.id === gameId);
    if (gameIndex === -1) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    
    // Check if user is in the game
    const game = games[gameIndex];
    const playerInGame = game.players.some((p: any) => p.id === session.user.id);
    
    if (!playerInGame && game.hostId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this game" },
        { status: 403 }
      );
    }
    
    // Update the game
    const updatedGame = {
      ...game,
      ...data,
      id: gameId, // Ensure ID doesn't change
    };
    
    games[gameIndex] = updatedGame;
    
    return NextResponse.json(updatedGame);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
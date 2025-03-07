import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  // Require authentication
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  try {
    // Get game ID from query parameter
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("id");
    
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
    
    // If gameId provided, return specific game
    if (gameId) {
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          players: true,
          rounds: {
            include: {
              winner: true,
            },
          },
        },
      });
      
      if (!game) {
        return NextResponse.json(
          { error: "Game not found" },
          { status: 404 }
        );
      }
      
      // Check if user is part of the game
      const isPlayerInGame = game.players.some(
        (player) => player.userId === user.id
      );
      
      if (!isPlayerInGame && game.ownerId !== user.id) {
        return NextResponse.json(
          { error: "You don't have access to this game" },
          { status: 403 }
        );
      }
      
      // Parse game state if it exists
      let parsedGameState = null;
      if (game.gameState) {
        try {
          parsedGameState = JSON.parse(game.gameState);
        } catch (e) {
          console.error("Error parsing game state:", e);
        }
      }
      
      // Parse player hands
      const parsedPlayers = game.players.map((player) => ({
        ...player,
        hand: player.hand ? JSON.parse(player.hand) : [],
      }));
      
      return NextResponse.json({
        ...game,
        gameState: parsedGameState,
        players: parsedPlayers,
      });
    }
    
    // Return list of games for the user
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          {
            players: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
      include: {
        players: true,
        rounds: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    return NextResponse.json(games);
  } catch (error) {
    console.error("Error in GET /api/game:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}

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
    
    // Create initial game state
    const initialGameState = {
      dominoChain: [],
      leftEnd: -1,
      rightEnd: -1,
      currentPlayer: 0,
      gameStarted: false,
      passCount: 0,
      roundEnded: false,
      double6Played: false,
      gamePhase: "setup",
    };
    
    // Create a new game in the database
    const game = await prisma.game.create({
      data: {
        ownerId: user.id,
        status: "waiting",
        gameState: JSON.stringify(initialGameState),
        players: {
          create: [
            // Human player
            { 
              userId: user.id,
              isAI: false,
              hand: JSON.stringify([]),
            },
            // AI players
            { isAI: true, hand: JSON.stringify([]) },
            { isAI: true, hand: JSON.stringify([]) },
            { isAI: true, hand: JSON.stringify([]) },
          ],
        },
      },
      include: {
        players: true,
        rounds: true,
      },
    });
    
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/game:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { gameId, gameState, status } = data;
    
    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }
    
    // Find the game
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
    
    // Check if user has permission to update
    const isPlayerInGame = game.players.some(
      (player) => player.userId === user.id
    );
    
    if (!isPlayerInGame && game.ownerId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this game" },
        { status: 403 }
      );
    }
    
    // Update the game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: status || game.status,
        gameState: gameState ? JSON.stringify(gameState) : game.gameState,
      },
      include: {
        players: true,
        rounds: true,
      },
    });
    
    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error in PUT /api/game:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
// src/app/api/game/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { initializeGame, playDomino, passTurn } from '@/lib/serverGameLogic';

// Handle GET requests to /api/game
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { players: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        players: true,
        rounds: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// Handle POST requests to /api/game
export async function POST(req: Request) {
  console.log("API: POST /api/game - Request received");
  
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    console.log("API: Unauthorized - No session");
    return NextResponse.json({ 
      error: 'Unauthorized',
      redirectTo: '/login'
    }, { status: 401 });
  }
  
  let requestBody;
  try {
    requestBody = await req.json();
    console.log("API: Request body parsed:", requestBody);
  } catch (error) {
    console.error("API: Error parsing request body:", error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  
  const { action, gameId, dominoIndex, end } = requestBody;
  
  try {
    console.log(`API: Processing action '${action}'`);
    
    switch (action) {
      case 'startGame':
        console.log(`API: Starting game for user ${session.user.id}`);
        const result = await handleStartGame(session.user.id);
        console.log(`API: Game started successfully, ID: ${result.game?.id}`);
        return NextResponse.json(result);
        
      case 'playDomino':
        console.log(`API: Playing domino for game ${gameId}`);
        return await handlePlayDomino(session.user.id, gameId, dominoIndex, end);
        
      case 'passTurn':
        console.log(`API: Passing turn for game ${gameId}`);
        return await handlePassTurn(session.user.id, gameId);
        
      default:
        console.log(`API: Invalid action '${action}'`);
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API: Error in game action:', error);
    return NextResponse.json({ 
      error: (error as Error).message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

async function handleStartGame(userId: string) {
  console.log("Function: handleStartGame - Creating new game");
  
  try {
    const game = await prisma.game.create({
      data: {
        ownerId: userId,
        players: {
          create: [
            { userId: userId }, // Human player
            { isAI: true },     // AI player 1
            { isAI: true },     // AI player 2
            { isAI: true }      // AI player 3
          ]
        }
      },
      include: { players: true }
    });
    
    console.log(`Game created with ID: ${game.id}, initializing...`);
    const initializedGame = await initializeGame(game.id);
    console.log("Game initialized successfully");
    
    return initializedGame;
  } catch (error) {
    console.error("Error in handleStartGame:", error);
    throw error;
  }
}

async function handlePlayDomino(userId: string, gameId: string, dominoIndex: number, end: 'left' | 'right') {
  console.log(`Function: handlePlayDomino - User: ${userId}, Game: ${gameId}, Index: ${dominoIndex}, End: ${end}`);
  
  try {
    const player = await prisma.player.findFirst({
      where: { 
        userId: userId, 
        gameId: gameId 
      }
    });
    
    if (!player) {
      console.log("Player not found in this game");
      return NextResponse.json({ error: 'Player not found in this game' }, { status: 404 });
    }
    
    console.log(`Found player with ID: ${player.id}, playing domino...`);
    const result = await playDomino(gameId, player.id, dominoIndex, end);
    console.log("Domino played successfully");
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in handlePlayDomino:", error);
    throw error;
  }
}

async function handlePassTurn(userId: string, gameId: string) {
  console.log(`Function: handlePassTurn - User: ${userId}, Game: ${gameId}`);
  
  try {
    const player = await prisma.player.findFirst({
      where: { 
        userId: userId, 
        gameId: gameId 
      }
    });
    
    if (!player) {
      console.log("Player not found in this game");
      return NextResponse.json({ error: 'Player not found in this game' }, { status: 404 });
    }
    
    console.log(`Found player with ID: ${player.id}, passing turn...`);
    const result = await passTurn(gameId, player.id);
    console.log("Turn passed successfully");
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in handlePassTurn:", error);
    throw error;
  }
}
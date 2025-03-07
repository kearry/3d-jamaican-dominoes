import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper functions for common database operations

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Create a new game
 */
export async function createGame(userId: string, options: any = {}) {
  return prisma.game.create({
    data: {
      createdById: userId,
      options: options,
      players: {
        create: [
          {
            userId,
            position: 0,
            isAI: false,
          },
          {
            position: 1,
            isAI: true,
            aiDifficulty: 'medium',
          },
          {
            position: 2,
            isAI: true,
            aiDifficulty: 'medium',
          },
          {
            position: 3,
            isAI: true,
            aiDifficulty: 'medium',
          },
        ],
      },
    },
    include: {
      players: true,
    },
  });
}

/**
 * Get a game by ID with all related data
 */
export async function getGameById(id: string) {
  return prisma.game.findUnique({
    where: { id },
    include: {
      players: {
        orderBy: {
          position: 'asc',
        },
      },
      rounds: {
        orderBy: {
          roundNumber: 'desc',
        },
        take: 1,
      },
    },
  });
}

/**
 * Update game state
 */
export async function updateGameState(gameId: string, gameState: any) {
  return prisma.gameRound.update({
    where: {
      id: gameState.id,
    },
    data: {
      state: gameState,
    },
  });
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
  return prisma.userPreference.findUnique({
    where: { userId },
  });
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: string, preferences: any) {
  return prisma.userPreference.upsert({
    where: { userId },
    update: { preferences },
    create: {
      userId,
      preferences,
    },
  });
}

export default prisma;
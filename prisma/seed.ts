import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.gameRound.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.game.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleared existing data');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      preferences: JSON.stringify({
        theme: 'light',
        notifications: true,
        sound: true,
      }),
    },
  });

  console.log(`👤 Created demo user: ${demoUser.email}`);

  // Create AI users for opponents
  const ai1 = await prisma.user.create({
    data: {
      name: 'AI Player 1',
      email: 'ai1@example.com',
    },
  });

  const ai2 = await prisma.user.create({
    data: {
      name: 'AI Player 2',
      email: 'ai2@example.com',
    },
  });

  const ai3 = await prisma.user.create({
    data: {
      name: 'AI Player 3',
      email: 'ai3@example.com',
    },
  });

  console.log('🤖 Created AI users');

  // Create a sample game
  const game = await prisma.game.create({
    data: {
      ownerId: demoUser.id,
      status: 'waiting',
      gameState: JSON.stringify({
        dominoChain: [],
        leftEnd: -1,
        rightEnd: -1,
        currentPlayer: 0,
        gameStarted: false,
        passCount: 0,
        roundEnded: false,
        double6Played: false,
        gamePhase: 'setup',
      }),
      players: {
        create: [
          {
            userId: demoUser.id,
            isAI: false,
            hand: JSON.stringify([]),
          },
          {
            userId: ai1.id,
            isAI: true,
            hand: JSON.stringify([]),
          },
          {
            userId: ai2.id,
            isAI: true,
            hand: JSON.stringify([]),
          },
          {
            userId: ai3.id,
            isAI: true,
            hand: JSON.stringify([]),
          },
        ],
      },
    },
  });

  console.log(`🎮 Created sample game with ID: ${game.id}`);
  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
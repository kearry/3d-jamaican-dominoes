import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

// System stores user preferences in a JSON field
// We'll create a userPreferences table in a real application
// For now we'll use metadata in the User model

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
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        games: {
          take: 10,
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Count games won
    const gamesWon = await prisma.gameRound.count({
      where: {
        winner: {
          userId: user.id,
        },
      },
    });
    
    // Format user profile
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      gamesPlayed: user.games.length,
      gamesWon,
      preferences: user.preferences ? JSON.parse(user.preferences) : {
        theme: 'light',
        notifications: true,
        sound: true,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in GET /api/user/profile:", error);
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
    const data = await request.json();
    
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
    
    // Get current preferences
    let preferences = user.preferences ? JSON.parse(user.preferences) : {
      theme: 'light',
      notifications: true,
      sound: true,
    };
    
    // Update preferences with new data
    if (data.preferences) {
      preferences = {
        ...preferences,
        ...data.preferences,
      };
    }
    
    // Update user in the database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name || user.name,
        preferences: JSON.stringify(preferences),
      },
      include: {
        games: {
          take: 10,
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });
    
    // Count games won
    const gamesWon = await prisma.gameRound.count({
      where: {
        winner: {
          userId: user.id,
        },
      },
    });
    
    // Format user profile
    const profile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      gamesPlayed: updatedUser.games.length,
      gamesWon,
      preferences,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in PUT /api/user/profile:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
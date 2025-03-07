import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// Mock user profiles (in a real app, this would be a database)
// We reference the same userProfiles object from the profile route
// In a real application, this would be a database access
declare const userProfiles: Record<string, any>;

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  // Require authentication
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  const userId = session.user.id;
  
  // If user doesn't have a profile, return default preferences
  if (!userProfiles[userId]) {
    return NextResponse.json({
      theme: 'light',
      notifications: true,
      sound: true,
    });
  }
  
  return NextResponse.json(userProfiles[userId].preferences);
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
  
  const userId = session.user.id;
  
  try {
    const preferences = await request.json();
    
    // Initialize user profile if it doesn't exist
    if (!userProfiles[userId]) {
      userProfiles[userId] = {
        id: userId,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        gamesPlayed: 0,
        gamesWon: 0,
        preferences: {
          theme: 'light',
          notifications: true,
          sound: true,
        },
        createdAt: new Date().toISOString(),
      };
    }
    
    // Update preferences
    userProfiles[userId].preferences = {
      ...userProfiles[userId].preferences,
      ...preferences,
    };
    
    return NextResponse.json(userProfiles[userId].preferences);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid preferences data" },
      { status: 400 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// Mock user profiles (in a real app, this would be a database)
const userProfiles: Record<string, any> = {};

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
  
  // Get or create user profile
  const profile = userProfiles[userId] || {
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
  
  // Store the profile if it was just created
  if (!userProfiles[userId]) {
    userProfiles[userId] = profile;
  }
  
  return NextResponse.json(profile);
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
    const data = await request.json();
    
    // Make sure the user has a profile
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
    
    // Update the profile (only allowed fields)
    const profile = userProfiles[userId];
    const updatedProfile = {
      ...profile,
      name: data.name || profile.name,
      // Don't allow overwriting certain fields
      email: profile.email,
      id: profile.id,
      createdAt: profile.createdAt,
      // Keep other fields
      gamesPlayed: data.gamesPlayed !== undefined ? data.gamesPlayed : profile.gamesPlayed,
      gamesWon: data.gamesWon !== undefined ? data.gamesWon : profile.gamesWon,
      // Keep existing preferences, add new ones
      preferences: {
        ...profile.preferences,
        ...(data.preferences || {}),
      },
    };
    
    userProfiles[userId] = updatedProfile;
    
    return NextResponse.json(updatedProfile);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
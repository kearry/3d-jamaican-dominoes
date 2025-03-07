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
    
    // Get preferences from user record
    let preferences;
    try {
      preferences = user.preferences ? JSON.parse(user.preferences) : {
        theme: 'light',
        notifications: true,
        sound: true,
      };
    } catch (e) {
      preferences = {
        theme: 'light',
        notifications: true,
        sound: true,
      };
    }
    
    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error in GET /api/user/preferences:", error);
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
    const newPreferences = await request.json();
    
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
    let currentPreferences;
    try {
      currentPreferences = user.preferences ? JSON.parse(user.preferences) : {
        theme: 'light',
        notifications: true,
        sound: true,
      };
    } catch (e) {
      currentPreferences = {
        theme: 'light',
        notifications: true,
        sound: true,
      };
    }
    
    // Merge with new preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...newPreferences,
    };
    
    // Update user in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferences: JSON.stringify(updatedPreferences),
      },
    });
    
    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error("Error in PUT /api/user/preferences:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
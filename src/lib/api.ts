/**
 * Service for interacting with the API
 */

// Game-related API calls
export const GameAPI = {
  // Get all games for the current user
  getUserGames: async () => {
    const response = await fetch('/api/game');
    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }
    return response.json();
  },

  // Get a specific game by ID
  getGame: async (gameId: string) => {
    const response = await fetch(`/api/game?id=${gameId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch game');
    }
    return response.json();
  },

  // Create a new game
  createGame: async (options = {}) => {
    const response = await fetch('/api/game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Failed to create game');
    }
    return response.json();
  },

  // Update a game
  updateGame: async (gameId: string, data: any) => {
    const response = await fetch('/api/game', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId,
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update game');
    }
    return response.json();
  },

  // Play a domino
  playDomino: async (gameId: string, dominoIndex: number, end: 'left' | 'right' | 'any') => {
    const response = await fetch('/api/game/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId,
        move: 'playDomino',
        dominoIndex,
        end,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to play domino');
    }
    return response.json();
  },

  // Pass a turn
  passTurn: async (gameId: string) => {
    const response = await fetch('/api/game/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId,
        move: 'pass',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to pass turn');
    }
    return response.json();
  },
};

// User-related API calls
export const UserAPI = {
  // Get the current user's profile
  getProfile: async () => {
    const response = await fetch('/api/user/profile');
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },

  // Update user preferences
  updatePreferences: async (preferences: any) => {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }
    return response.json();
  },
};
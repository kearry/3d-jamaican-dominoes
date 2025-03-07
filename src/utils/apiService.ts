import { signIn } from 'next-auth/react';

// Type for API response
type ApiResponse<T> = {
  data?: T;
  error?: string;
  redirectTo?: string;
  status: number;
};

/**
 * Generic fetch function with authentication handling
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Response data or throws an error
 */
export async function fetchWithAuth<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Parse the response
  let jsonResponse: ApiResponse<T>;
  try {
    jsonResponse = await res.json();
  } catch (e) {
    throw new Error('Failed to parse response');
  }

  // Handle authentication errors
  if (res.status === 401) {
    console.log('Authentication required, redirecting to login...');
    
    // If the API returned a specific redirect URL, use it
    const redirectUrl = jsonResponse.redirectTo || '/login';
    
    // Use Next-Auth's signIn to redirect to login
    signIn(undefined, { callbackUrl: window.location.pathname });
    
    // Throw an error to stop further execution
    throw new Error('Authentication required');
  }

  // Handle other errors
  if (!res.ok) {
    throw new Error(jsonResponse.error || 'An unknown error occurred');
  }

  // Return the data
  return jsonResponse.data as T;
}

/**
 * Start a new game
 */
export async function startGame() {
  return fetchWithAuth('/api/game', {
    method: 'POST',
    body: JSON.stringify({ action: 'startGame' }),
  });
}

/**
 * Play a domino
 * @param gameId The game ID
 * @param dominoIndex The index of the domino in the player's hand
 * @param end The end to play the domino on ('left' or 'right')
 */
export async function playDomino(gameId: string, dominoIndex: number, end: 'left' | 'right') {
  return fetchWithAuth('/api/game', {
    method: 'POST',
    body: JSON.stringify({ action: 'playDomino', gameId, dominoIndex, end }),
  });
}

/**
 * Pass a turn
 * @param gameId The game ID
 */
export async function passTurn(gameId: string) {
  return fetchWithAuth('/api/game', {
    method: 'POST',
    body: JSON.stringify({ action: 'passTurn', gameId }),
  });
}

/**
 * Get games for the current user
 */
export async function getGames() {
  return fetchWithAuth('/api/games');
}

/**
 * Get a specific game
 * @param gameId The game ID
 */
export async function getGame(gameId: string) {
  return fetchWithAuth(`/api/games/${gameId}`);
}

/**
 * Send debug information to the server
 * @param type The type of debug information
 * @param content The debug content
 */
export async function sendDebug(type: string, content: any) {
  try {
    await fetch('/api/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, content }),
    });
  } catch (error) {
    console.error('Failed to send debug info:', error);
  }
}
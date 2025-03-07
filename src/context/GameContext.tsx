'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  GameState,
  Player,
  Domino,
  GameContextType,
  GamePhase,
  DominoState,
} from '../types/gameTypes';
import { GameAPI } from '@/lib/api';
import { useSession } from 'next-auth/react';

const initialState: GameState = {
  players: [],
  leftEnd: -1,
  rightEnd: -1,
  currentPlayer: 0,
  dominoes: [],
  dominoChain: [],
  gameStarted: false,
  roundWinner: null,
  tournamentScores: [0, 0, 0, 0],
  gamePhase: GamePhase.Setup,
  passCount: 0,
  roundEnded: false,
  double6Played: false,
  startingPlayerId: -1,
};

// Create the GameContext
export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<GameState>(initialState);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const { data: session } = useSession();

  // Load game data if we have a game ID
  useEffect(() => {
    if (currentGameId && session) {
      loadGame(currentGameId);
    }
  }, [currentGameId, session]);

  // Load a game from the API
  const loadGame = async (gameId: string) => {
    try {
      const gameData = await GameAPI.getGame(gameId);
      setState(gameData);
    } catch (error) {
      console.error('Failed to load game:', error);
    }
  };

  const startGame = useCallback(async () => {
    try {
      // Create a new game via the API
      const newGame = await GameAPI.createGame();
      setCurrentGameId(newGame.id);
      setState({
        ...newGame,
        gameStarted: true,
        gamePhase: GamePhase.Play
      });
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  }, []);

  // Calculate position and rotation based on where in the chain it's placed
  const calculateDominoPositionAndRotation = (
    domino: Domino,
    chain: Domino[],
    end: 'left' | 'right' | 'any'
  ): { position: [number, number, number]; rotation: [number, number, number] } => {
    const isDouble = domino.leftPips === domino.rightPips;

    // First domino placed at the center
    if (chain.length === 0) {
      return {
        position: [0, 0, 0],
        // For dominoes laying flat, we use X rotation of PI/2 (90 degrees)
        // If it's a double, rotate it 90 degrees around Y axis as well
        rotation: [Math.PI / 2, isDouble ? Math.PI / 2 : 0, 0]
      };
    }

    // Get the appropriate anchor domino based on placement end
    const anchorDomino = end === 'left' ? chain[0] : chain[chain.length - 1];
    const isDoublePrevious = anchorDomino.leftPips === anchorDomino.rightPips;

    // Calculate position based on the placement end and whether dominoes are doubles
    let x, z;
    let yRotation = 0;

    // Space dominoes farther apart to account for larger scale
    const spacing = 3; // Increased spacing value

    if (end === 'left') {
      // When placing on the left end
      if (isDoublePrevious) {
        // If previous domino is a double (perpendicular), place to the left
        x = anchorDomino.position[0] - spacing;
        z = anchorDomino.position[2];
      } else {
        // Standard left placement
        x = anchorDomino.position[0] - spacing;
        z = anchorDomino.position[2];
      }
    } else {
      // When placing on the right end
      if (isDoublePrevious) {
        // If previous domino is a double (perpendicular), place to the right
        x = anchorDomino.position[0] + spacing;
        z = anchorDomino.position[2];
      } else {
        // Standard right placement
        x = anchorDomino.position[0] + spacing;
        z = anchorDomino.position[2];
      }
    }

    // If the new domino is a double, place it perpendicular
    if (isDouble) {
      yRotation = Math.PI / 2;
    }

    return {
      position: [x, 0, z],
      // Ensure the domino is fully flat on the table
      rotation: [Math.PI / 2, yRotation, 0]
    };
  };

  const playDomino = useCallback(
    async (domino: Domino, end: 'left' | 'right' | 'any') => {
      if (!currentGameId) return;

      try {
        // Find the domino index in the player's hand
        const currentPlayer = state.players[state.currentPlayer];
        const dominoIndex = currentPlayer.dominoes.findIndex(
          d => d.leftPips === domino.leftPips && d.rightPips === domino.rightPips
        );

        if (dominoIndex === -1) {
          console.error("Domino not found in player's hand");
          return;
        }

        // Call the API to make the move
        const updatedGame = await GameAPI.playDomino(currentGameId, dominoIndex, end);
        setState(updatedGame);
      } catch (error) {
        console.error('Failed to play domino:', error);
      }
    },
    [currentGameId, state.players, state.currentPlayer]
  );

  const passTurn = useCallback(async () => {
    if (!currentGameId) return;

    try {
      // Call the API to pass the turn
      const updatedGame = await GameAPI.passTurn(currentGameId);
      setState(updatedGame);
    } catch (error) {
      console.error('Failed to pass turn:', error);
    }
  }, [currentGameId]);

  const canPlay = useCallback((state: GameState, player: Player): boolean => {
    if (state.dominoChain.length === 0) {
      return player.dominoes.some(
        (domino) => domino.leftPips === 6 && domino.rightPips === 6
      );
    }
    return player.dominoes.some(
      (domino) =>
        domino.leftPips === state.leftEnd ||
        domino.rightPips === state.leftEnd ||
        domino.leftPips === state.rightEnd ||
        domino.rightPips === state.rightEnd
    );
  }, []);

  const resetGame = useCallback(() => {
    setCurrentGameId(null);
    setState(initialState);
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        startGame,
        playDomino,
        passTurn,
        canPlay,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the GameContext
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
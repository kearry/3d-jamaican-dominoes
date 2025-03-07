'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import {
  GameState,
  Player,
  Domino,
  GameContextType,
  GamePhase,
  DominoState,
} from '../types/gameTypes';

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

  const startGame = useCallback(() => {
    // Implementation for starting a game would go here
    // Creates shuffled dominoes and deals them to players
    setState({
      ...initialState,
      gameStarted: true,
      gamePhase: GamePhase.Play
    });
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
    (domino: Domino, end: 'left' | 'right' | 'any') => {
      // Implementation for playing a domino would go here
      // This would include validating the move, updating the game state, etc.
      console.log('Playing domino', domino, 'at end', end);
    },
    []
  );

  const passTurn = useCallback(() => {
    // Implementation for passing a turn would go here
    console.log('Passing turn');
  }, []);

  const canPlay = useCallback((state: GameState, player: Player): boolean => {
    // Implementation for checking if a player can play would go here
    return true;
  }, []);

  const resetGame = useCallback(() => {
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
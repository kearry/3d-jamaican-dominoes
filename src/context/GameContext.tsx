// src/context/GameContext.tsx

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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
import { shuffleDominoes, dealDominoes, validateDominoPlacement, prepareDominoForPlacement } from '@/utils/dominoUtils';
import { isValidDominoChain } from '@/utils/validateDominoChain';
import { debugGameState, analyzePlayableDominoes, capturePageState } from '@/utils/debugUtils';
import * as apiService from '@/utils/apiService';

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
  const [gameId, setGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Start a new game via API
  const startGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.startGame();
      setGameId(response.game.id);
      
      // Initialize local state based on API response
      const players = response.playerHands.map((hand: Domino[], index: number) => ({
        id: index,
        name: `Player ${index + 1}`,
        dominoes: hand,
        isAI: index !== 0,
      }));
      
      setState({
        ...initialState,
        players,
        currentPlayer: response.startingPlayerIndex,
        dominoes: response.dominoes,
        gameStarted: true,
        gamePhase: GamePhase.Play,
        startingPlayerId: response.startingPlayerIndex,
      });
    } catch (err) {
      console.error('Failed to start game:', err);
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setIsLoading(false);
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
      if (!gameId) {
        console.error("Cannot play domino: no active game");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Find the domino index in the player's hand
        const currentPlayer = state.players[state.currentPlayer];
        const dominoIndex = currentPlayer.dominoes.findIndex(
          d => d.leftPips === domino.leftPips && d.rightPips === domino.rightPips
        );

        if (dominoIndex === -1) {
          throw new Error("Domino not found in player's hand");
        }

        // Call API to play the domino
        await apiService.playDomino(gameId, dominoIndex, end as 'left' | 'right');
        
        // Update local state immediately for better UX
        setState((prevState: GameState) => {
          const isDoubleSix = domino.leftPips === 6 && domino.rightPips === 6;
          const double6Played = prevState.double6Played || isDoubleSix;

          // Validate the move
          if (!validateDominoPlacement(domino, end, prevState.dominoChain)) {
            console.error("Invalid domino placement!");
            return prevState;
          }

          const updatedPlayers = prevState.players.map((player, index) => {
            if (index === prevState.currentPlayer) {
              return {
                ...player,
                dominoes: player.dominoes.filter(
                  (d) =>
                    !(
                      d.leftPips === domino.leftPips &&
                      d.rightPips === domino.rightPips
                    )
                ),
              };
            }
            return player;
          });

          // Prepare the domino (potentially flip it) for placement
          const preparedDomino = prepareDominoForPlacement(domino, end, prevState.dominoChain);

          // Calculate position and rotation for the domino
          const { position, rotation } = calculateDominoPositionAndRotation(
            preparedDomino,
            prevState.dominoChain,
            end
          );

          // Create a copy of the domino with updated position and rotation
          const updatedDomino = {
            ...preparedDomino,
            position,
            rotation,
          };

          // Add the domino to the chain
          const newChain = [...prevState.dominoChain];
          if (end === 'left' || (end === 'any' && prevState.dominoChain.length === 0)) {
            newChain.unshift(updatedDomino);
          } else {
            newChain.push(updatedDomino);
          }

          if (!isValidDominoChain(newChain)) {
            console.error('Invalid domino chain!', newChain);
            return prevState;
          }

          const nextPlayer =
            (prevState.currentPlayer + 1) % prevState.players.length;

          return {
            ...prevState,
            players: updatedPlayers,
            dominoChain: newChain,
            leftEnd: newChain[0].leftPips,
            rightEnd: newChain[newChain.length - 1].rightPips,
            currentPlayer: nextPlayer,
            passCount: 0,
            double6Played,
          };
        });
      } catch (err) {
        console.error('Failed to play domino:', err);
        setError(err instanceof Error ? err.message : 'Failed to play domino');
      } finally {
        setIsLoading(false);
      }
    },
    [gameId, state]
  );

  const passTurn = useCallback(async () => {
    if (!gameId) {
      console.error("Cannot pass turn: no active game");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call API to pass turn
      await apiService.passTurn(gameId);
      
      // Update local state
      setState((prevState) => {
        const nextPlayer =
          (prevState.currentPlayer + 1) % prevState.players.length;
        const newPassCount = prevState.passCount + 1;
        let roundEnded = false;
        let roundWinner = prevState.roundWinner;

        if (newPassCount >= prevState.players.length) {
          roundEnded = true;
          roundWinner = findWinnerOfBlockedGame(prevState.players);
        }

        return {
          ...prevState,
          currentPlayer: nextPlayer,
          passCount: newPassCount,
          roundEnded,
          roundWinner,
        };
      });
    } catch (err) {
      console.error('Failed to pass turn:', err);
      setError(err instanceof Error ? err.message : 'Failed to pass turn');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

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

  const debugState = useCallback(() => {
    console.log('===== GAME STATE DEBUG =====');
    console.log('Current Game State:', state);
    console.log('Game ID:', gameId);

    // Detailed info about domino chain
    console.log('Domino Chain Details:');
    if (state.dominoChain.length === 0) {
      console.log('  Chain is empty');
    } else {
      state.dominoChain.forEach((domino, index) => {
        console.log(`  [${index}] Left: ${domino.leftPips} Right: ${domino.rightPips}`);
      });
    }

    // Check chain validity
    console.log('Chain Valid:', isValidDominoChain(state.dominoChain));

    // Current player info
    const currentPlayer = state.players[state.currentPlayer];
    console.log('Current Player:', currentPlayer?.name, 'ID:', state.currentPlayer);
    console.log('Current Player Dominoes:');
    currentPlayer?.dominoes.forEach((domino, index) => {
      console.log(`  [${index}] Left: ${domino.leftPips} Right: ${domino.rightPips}`);
    });

    // Check playable dominoes
    if (currentPlayer) {
      const playableDominoes = currentPlayer.dominoes.filter(domino =>
        validateDominoPlacement(domino, 'left', state.dominoChain) ||
        validateDominoPlacement(domino, 'right', state.dominoChain)
      );
      console.log('Playable Dominoes:', playableDominoes.length);
      playableDominoes.forEach((domino, index) => {
        console.log(`  [${index}] Left: ${domino.leftPips} Right: ${domino.rightPips}`);
      });
    }

    console.log('===== END DEBUG =====');

    // Use our new debug utilities
    debugGameState(state);

    // Analyze the current player's options
    if (currentPlayer) {
      analyzePlayableDominoes(state, currentPlayer);
    }

    // Take a snapshot of the current page state
    capturePageState();

  }, [state, gameId]);

  useEffect(() => {
    const handleAITurn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const aiPlayer = state.players[state.currentPlayer];
      const aiMove = calculateAIMove(state, aiPlayer);
      if (aiMove) {
        playDomino(aiMove.domino, aiMove.end);
      } else {
        passTurn();
      }
    };

    if (state.gameStarted && state.players[state.currentPlayer]?.isAI) {
      handleAITurn();
    }
  }, [state, playDomino, passTurn]);

  return (
    <GameContext.Provider
      value={{
        state,
        setState,
        startGame,
        playDomino,
        passTurn,
        canPlay,
        debugState,
        isLoading,
        error,
        gameId,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Move helper functions outside the component
const findWinnerOfBlockedGame = (players: Player[]): number => {
  let minPips = Infinity;
  let winner = 0;
  players.forEach((player, index) => {
    const totalPips = player.dominoes.reduce(
      (sum: number, domino: Domino) =>
        sum + domino.leftPips + domino.rightPips,
      0
    );
    if (totalPips < minPips) {
      minPips = totalPips;
      winner = player.id;
    }
  });
  return winner;
};

const calculateAIMove = (state: GameState, aiPlayer: Player) => {
  if (state.dominoChain.length === 0) {
    // First move must be double 6
    const double6 = aiPlayer.dominoes.find(
      domino => domino.leftPips === 6 && domino.rightPips === 6
    );
    if (double6) {
      return { domino: double6, end: 'any' as const };
    }
    return null;
  }

  for (const domino of aiPlayer.dominoes) {
    if (
      domino.leftPips === state.leftEnd ||
      domino.rightPips === state.leftEnd
    ) {
      return { domino, end: 'left' as const };
    }
    if (
      domino.leftPips === state.rightEnd ||
      domino.rightPips === state.rightEnd
    ) {
      return { domino, end: 'right' as const };
    }
  }
  return null;
};

// Custom hook to use the GameContext
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
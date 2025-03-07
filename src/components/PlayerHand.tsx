'use client';

import React, { useState } from 'react';
import { Domino as DominoType } from '../types/gameTypes';
import Domino from './Domino';
import { useGameContext } from '@/context/GameContext';

interface PlayerHandProps {
  playerId?: number;
  isCurrentPlayer?: boolean;
  className?: string;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  playerId,
  isCurrentPlayer = false,
  className = '',
}) => {
  const { state, playDomino } = useGameContext();
  const [selectedDomino, setSelectedDomino] = useState<number | null>(null);
  const [placementEnd, setPlacementEnd] = useState<'left' | 'right' | 'any'>('any');
  const [showPlacementOptions, setShowPlacementOptions] = useState(false);

  // Get the player based on the provided playerId or use the current player
  const player = playerId !== undefined
    ? state.players[playerId]
    : state.players[state.currentPlayer];

  // Get dominoes for this hand
  const dominoes = player?.dominoes || [];

  // Handle domino selection
  const handleSelectDomino = (index: number) => {
    // Toggle selection
    if (selectedDomino === index) {
      setSelectedDomino(null);
      setShowPlacementOptions(false);
    } else {
      setSelectedDomino(index);
      
      // Show placement options if there are dominoes in the chain
      if (state.dominoChain.length > 0) {
        setShowPlacementOptions(true);
      } else {
        // If first domino, place it in the center
        handlePlayDomino('any');
      }
    }
  };

  // Handle playing a domino
  const handlePlayDomino = (end: 'left' | 'right' | 'any') => {
    if (selectedDomino === null) return;
    
    const domino = dominoes[selectedDomino];
    playDomino(domino, end);
    
    // Reset selection
    setSelectedDomino(null);
    setShowPlacementOptions(false);
  };

  // Check if this is the player's hand and they can interact
  const canInteract = isCurrentPlayer && state.gamePhase === 'play';

  // Determine if a domino can be played (check against game state)
  const canPlayDomino = (domino: DominoType): boolean => {
    // For first move, check if it's double-6
    if (state.dominoChain.length === 0) {
      return domino.leftPips === 6 && domino.rightPips === 6;
    }
    
    // Check if domino can be placed on either end
    const { leftEnd, rightEnd } = state;
    return (
      domino.leftPips === leftEnd ||
      domino.rightPips === leftEnd ||
      domino.leftPips === rightEnd ||
      domino.rightPips === rightEnd
    );
  };

  return (
    <div
      className={`relative flex flex-wrap justify-center items-center gap-2 p-4 ${
        isCurrentPlayer ? 'bg-blue-50 rounded-lg shadow-inner' : ''
      } ${className}`}
    >
      <h3 className="w-full text-center font-medium text-sm mb-2">
        {player ? player.name : 'Unknown Player'}
        {isCurrentPlayer && ' (Your Turn)'}
      </h3>
      
      <div className="flex flex-wrap justify-center gap-2">
        {dominoes.map((domino, index) => (
          <div
            key={`domino-${index}`}
            className={`relative cursor-pointer transform transition-transform ${
              selectedDomino === index ? 'scale-110' : ''
            } ${canPlayDomino(domino) && canInteract ? 'hover:scale-105' : 'opacity-80'}`}
            onClick={() => canInteract && handleSelectDomino(index)}
          >
            <div className="w-16 h-32 bg-white border border-gray-300 rounded flex flex-col justify-center items-center overflow-hidden shadow-domino">
              <div className="w-full h-1/2 border-b border-gray-400 flex justify-center items-center">
                {Array.from({ length: domino.leftPips }).map((_, i) => (
                  <div
                    key={`left-pip-${i}`}
                    className="w-2 h-2 bg-black rounded-full m-0.5"
                  />
                ))}
              </div>
              <div className="w-full h-1/2 flex justify-center items-center">
                {Array.from({ length: domino.rightPips }).map((_, i) => (
                  <div
                    key={`right-pip-${i}`}
                    className="w-2 h-2 bg-black rounded-full m-0.5"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Placement options overlay */}
      {showPlacementOptions && selectedDomino !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h4 className="text-lg font-medium mb-3">Place domino at:</h4>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handlePlayDomino('left')}
              >
                Left End
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handlePlayDomino('right')}
              >
                Right End
              </button>
              <button
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => setShowPlacementOptions(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {dominoes.length === 0 && (
        <div className="py-4 text-gray-500 italic text-sm">
          {isCurrentPlayer ? 'You have no dominoes left!' : 'No dominoes'}
        </div>
      )}
    </div>
  );
};

export default PlayerHand;
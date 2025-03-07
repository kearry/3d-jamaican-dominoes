'use client';

import React from 'react';
import DominoChain from './DominoChain';
import { useGameContext } from '../context/GameContext';

const GameBoard: React.FC = () => {
  const { state, startGame } = useGameContext();

  return (
    <div className="h-full flex flex-col">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold">Domino Table</h1>
      </div>
      
      <div className="flex-grow bg-gradient-to-b from-gray-100 to-gray-300 rounded-md shadow-lg overflow-hidden">
        <DominoChain />
      </div>
      
      {!state.gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={startGame}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
          >
            Start Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
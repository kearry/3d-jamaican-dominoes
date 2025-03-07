'use client';

import React, { useState } from 'react';
import { GameProvider } from '@/context/GameContext';
import GameBoard from '@/components/GameBoard';

export default function Home() {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="p-4 bg-slate-800 text-white">
        <h1 className="text-3xl font-bold">Jamaican Dominoes</h1>
      </header>
      
      <div className="flex-grow flex">
        <GameProvider>
          <div className="w-full h-[500px] p-6">
            <GameBoard />
          </div>
        </GameProvider>
      </div>
      
      <footer className="p-4 flex justify-between items-center border-t">
        <div className="flex items-center space-x-4">
          <p>Current Player: Player 1</p>
          <div className="flex space-x-2">
            <span>Player 1 (Current)</span>
            <span>Player 2</span>
            <span>Player 3</span>
            <span>Player 4</span>
          </div>
        </div>
        
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Debug Game State
        </button>
      </footer>
      
      {showDebug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Debug Game State</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({ message: 'Game state would be displayed here in a real implementation' }, null, 2)}
            </pre>
            <button
              onClick={() => setShowDebug(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
# 3D Jamaican Dominoes

A modern web-based implementation of the classic Jamaican Dominoes game, rendered in beautiful 3D using Three.js and Next.js.

![3D Jamaican Dominoes Game](screenshot.png)

## Features

- Fully interactive 3D dominoes game with realistic visual rendering
- Dominoes laid flat on a wooden table surface
- Proper 3D physics and game mechanics
- Special handling for double dominoes (placed perpendicular to the chain)
- Four-player support with AI opponents
- Game state management and validation
- Debug mode for development and testing

## Technology Stack

- **Frontend Framework**: Next.js 14
- **3D Rendering**: Three.js with React Three Fiber
- **UI Components**: React with Tailwind CSS
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/3d-domino-game.git
   cd 3d-domino-game
   ```

2. Install dependencies:

   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server:

   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
3d-domino-game/
├── public/           # Static assets
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   │   ├── Domino.tsx           # 3D domino component
│   │   ├── DominoChain.tsx      # Chain of played dominoes
│   │   ├── GameBoard.tsx        # Main game board component
│   │   ├── PlayerHand.tsx       # Player's hand component
│   │   └── Table.tsx            # 3D table component
│   ├── context/      # React context for game state
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── .env              # Environment variables
└── next.config.js    # Next.js configuration
```

## Game Rules

This implementation follows traditional Jamaican dominoes rules:

- The game is played with a standard set of 28 dominoes
- Four players participate, either as individuals or on teams
- The player with the double-six starts the game
- Players take turns placing matching dominoes
- Double dominoes are placed perpendicular to the chain
- The first player to play all their dominoes wins

See the [USER_GUIDE.md](USER_GUIDE.md) for detailed gameplay instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js and React Three Fiber communities
- NextJS team
- All contributors to this project
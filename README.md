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
- **Authentication** with NextAuth.js (GitHub, Google, and Credentials providers)
- **API routes** for game state management and multiplayer support

## Technology Stack

- **Frontend Framework**: Next.js 14
- **3D Rendering**: Three.js with React Three Fiber
- **UI Components**: React with Tailwind CSS
- **Authentication**: NextAuth.js (multiple providers)
- **API**: Next.js API Routes

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/kearry/3d-jamaican-dominoes.git
   cd 3d-jamaican-dominoes
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
   Edit `.env.local` to add your authentication provider details.

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
3d-jamaican-dominoes/
├── public/           # Static assets
├── src/
│   ├── app/          # Next.js app directory
│   │   ├── api/      # API routes
│   │   │   ├── auth/ # Authentication API
│   │   │   └── game/ # Game state API
│   │   └── login/    # Login page
│   ├── components/   # React components
│   │   ├── Domino.tsx           # 3D domino component
│   │   ├── DominoChain.tsx      # Chain of played dominoes
│   │   ├── GameBoard.tsx        # Main game board component
│   │   ├── PlayerHand.tsx       # Player's hand component
│   │   └── Table.tsx            # 3D table component
│   ├── context/      # React context for game state
│   ├── lib/          # Utility libraries and services
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── .env.example      # Example environment variables
└── next.config.js    # Next.js configuration
```

## Authentication

The game supports multiple authentication methods:

- **GitHub OAuth**: Sign in with your GitHub account
- **Google OAuth**: Sign in with your Google account
- **Credentials**: Username/password authentication (demo account available)

To configure authentication:

1. Create OAuth applications in GitHub and/or Google developer consoles
2. Add the client IDs and secrets to your `.env.local` file
3. Set a secure `NEXTAUTH_SECRET` for session encryption

## API Routes

The game includes API routes for managing game state:

- `/api/auth/*`: NextAuth.js authentication endpoints
- `/api/game`: Endpoints for creating, retrieving, and updating games
- `/api/game/move`: Endpoints for making moves in a game (playing dominoes, passing)

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
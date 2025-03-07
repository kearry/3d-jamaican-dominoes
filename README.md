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
- **Database persistence** with Prisma ORM

## Technology Stack

- **Frontend Framework**: Next.js 14
- **3D Rendering**: Three.js with React Three Fiber
- **UI Components**: React with Tailwind CSS
- **Authentication**: NextAuth.js (multiple providers)
- **API**: Next.js API Routes
- **Database**: Prisma ORM with PostgreSQL
- **Testing**: Jest and React Testing Library
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- PostgreSQL (optional if using Docker)

### Installation

#### Local Development

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
   Edit `.env.local` to add your authentication provider details and database URL.

4. Initialize the database:
   ```
   npm run db:migrate
   ```

5. Seed the database with initial data:
   ```
   npm run db:seed
   ```

6. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

7. Open your browser and navigate to `http://localhost:3000`

#### Using Docker Compose

1. Clone the repository:
   ```
   git clone https://github.com/kearry/3d-jamaican-dominoes.git
   cd 3d-jamaican-dominoes
   ```

2. Create an `.env` file with your environment variables:
   ```
   cp .env.example .env
   ```
   
3. Start the application with Docker Compose:
   ```
   docker-compose up -d
   ```

4. The application will be available at `http://localhost:3000`

## Deployment

### Vercel Deployment

The easiest way to deploy this application is using Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Set up the required environment variables
4. Deploy

### Docker Deployment

To deploy using Docker:

1. Build the Docker image:
   ```
   docker build -t jamaican-dominoes .
   ```

2. Run the container:
   ```
   docker run -p 3000:3000 -e DATABASE_URL=your_database_url -e NEXTAUTH_URL=your_app_url -e NEXTAUTH_SECRET=your_secret jamaican-dominoes
   ```

### Railway/Render/DigitalOcean Deployment

This application can also be deployed to platforms like Railway, Render, or DigitalOcean App Platform:

1. Push your code to GitHub
2. Connect your repository to your chosen platform
3. Configure environment variables
4. Deploy

## Project Structure

```
3d-jamaican-dominoes/
├── public/           # Static assets
├── prisma/           # Database schema and migrations
│   ├── schema.prisma # Prisma schema definition
│   └── seed.ts       # Database seed script
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
│   │   └── prisma.ts # Prisma client setup
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── __tests__/        # Test files
├── .github/          # GitHub Actions workflows
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile        # Docker configuration
├── jest.config.js    # Jest configuration
├── .eslintrc.js      # ESLint configuration
├── .prettierrc       # Prettier configuration
├── .env.example      # Example environment variables
└── next.config.js    # Next.js configuration
```

## Database Schema

The application uses Prisma ORM with the following main models:

- **User**: Player accounts with authentication
- **Game**: Represents a game session
- **Player**: Represents a player in a game (can be AI)
- **GameRound**: Tracks rounds within a game

Game state is stored as JSON in the database, allowing for flexible representation of the domino chain and game progress.

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
- `/api/user/profile`: User profile management
- `/api/user/preferences`: User preferences management

## Game Rules

This implementation follows traditional Jamaican dominoes rules:

- The game is played with a standard set of 28 dominoes
- Four players participate, either as individuals or on teams
- The player with the double-six starts the game
- Players take turns placing matching dominoes
- Double dominoes are placed perpendicular to the chain
- The first player to play all their dominoes wins

See the [USER_GUIDE.md](USER_GUIDE.md) for detailed gameplay instructions.

## Testing

The project uses Jest and React Testing Library for testing. To run tests:

```
npm test
```

For test coverage:

```
npm test -- --coverage
```

## Development

### Code Quality Tools

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type checking

Run these checks with:

```
npm run lint
npx tsc --noEmit
```

### CI/CD

The project uses GitHub Actions for CI/CD. On every push and pull request to the main branch, the workflow:
1. Runs linting
2. Type checks
3. Runs tests
4. Builds the application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js and React Three Fiber communities
- NextJS team
- Prisma team
- All contributors to this project
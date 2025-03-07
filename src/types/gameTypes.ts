// src/types/gameTypes.ts

export enum GamePhase {
  Setup,
  Play,
  RoundEnd,
  TournamentEnd,
}

export enum DominoState {
  Connected = 1,
  Disconnected = 0,
}

export type Player = {
  id: number;
  name: string;
  dominoes: Domino[];
  isAI: boolean;
};

export type GameState = {
  players: Player[];
  leftEnd: number;
  rightEnd: number;
  currentPlayer: number;
  dominoes: Domino[];
  dominoChain: Domino[];
  gameStarted: boolean;
  roundWinner: number | null;
  tournamentScores: number[];
  gamePhase: GamePhase;
  passCount: number;
  roundEnded: boolean;
  double6Played: boolean;
  startingPlayerId: number;
};

export type Domino = {
  leftState: DominoState;
  rightState: DominoState;
  leftPips: number;
  rightPips: number;
  position: [number, number, number];
  rotation: [number, number, number];
};

export type GameContextType = {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  startGame: () => Promise<void>;
  playDomino: (domino: Domino, end: 'left' | 'right' | 'any') => Promise<void>;
  passTurn: () => Promise<void>;
  canPlay: (state: GameState, player: Player) => boolean;
  debugState: () => void;
  // New properties for API state
  isLoading: boolean;
  error: string | null;
  gameId: string | null;
};

export type PlayerWithHand = {
  id: string;
  userId: string | null;
  gameId: string;
  score: number;
  isAI: boolean;
  hand: string;
};

export type GameWithState = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  status: string;
  gameState: string;
  players: PlayerWithHand[];
};

// API response types
export type GameApiResponse = {
  game: {
    id: string;
    [key: string]: any;
  };
  playerHands: Domino[][];
  dominoes: Domino[];
  startingPlayerIndex: number;
};

export type ErrorApiResponse = {
  error: string;
  redirectTo?: string;
};
export enum GamePhase {
  Setup = 'setup',
  Play = 'play',
  End = 'end',
}

export interface Domino {
  leftPips: number;
  rightPips: number;
  position: [number, number, number];
  rotation: [number, number, number];
  state?: DominoState;
}

export enum DominoState {
  InHand = 'inHand',
  Played = 'played',
  Selected = 'selected',
}

export interface Player {
  id: number;
  name: string;
  dominoes: Domino[];
  isAI: boolean;
}

export interface GameState {
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
}

export interface GameContextType {
  state: GameState;
  startGame: () => void;
  playDomino: (domino: Domino, end: 'left' | 'right' | 'any') => void;
  passTurn: () => void;
  canPlay: (state: GameState, player: Player) => boolean;
  resetGame: () => void;
  setCanPlayValue?: (value: boolean) => void; // For debugging
  triggerAIMove?: () => void; // For debugging
}

export interface ValidPlacement {
  valid: boolean;
  end?: 'left' | 'right' | 'any';
}
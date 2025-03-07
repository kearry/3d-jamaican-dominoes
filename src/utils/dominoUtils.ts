import { Domino } from '../types/gameTypes';

/**
 * Creates a full set of dominoes (double-six)
 */
export const createDominoSet = (): Domino[] => {
  const dominoes: Domino[] = [];
  
  // Create all possible combinations from 0-0 to 6-6
  for (let left = 0; left <= 6; left++) {
    for (let right = left; right <= 6; right++) {
      dominoes.push({
        leftPips: left,
        rightPips: right,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      });
    }
  }
  
  return dominoes;
};

/**
 * Shuffles an array of dominoes using Fisher-Yates algorithm
 */
export const shuffleDominoes = (): Domino[] => {
  const dominoes = createDominoSet();
  
  // Fisher-Yates shuffle
  for (let i = dominoes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dominoes[i], dominoes[j]] = [dominoes[j], dominoes[i]];
  }
  
  return dominoes;
};

/**
 * Deal dominoes to players (4 players, 7 dominoes each)
 */
export const dealDominoes = (dominoes: Domino[]): Domino[][] => {
  const hands: Domino[][] = [[], [], [], []];
  const totalPlayers = 4;
  const dominoesPerPlayer = 7;
  
  // Deal dominoes to each player
  for (let i = 0; i < totalPlayers * dominoesPerPlayer; i++) {
    const playerIndex = i % totalPlayers;
    hands[playerIndex].push(dominoes[i]);
  }
  
  return hands;
};

/**
 * Validates if a domino can be placed at a specific end of the chain
 */
export const validateDominoPlacement = (
  domino: Domino,
  end: 'left' | 'right' | 'any',
  chain: Domino[]
): boolean => {
  // First domino must be double-six
  if (chain.length === 0) {
    return domino.leftPips === 6 && domino.rightPips === 6;
  }
  
  // Get the pips at the end where we want to place the domino
  const endPips = end === 'left' ? chain[0].leftPips : chain[chain.length - 1].rightPips;
  
  // Check if the domino can be placed at that end (matches the pips)
  return domino.leftPips === endPips || domino.rightPips === endPips;
};

/**
 * Prepares a domino for placement by potentially flipping it to match the end
 */
export const prepareDominoForPlacement = (
  domino: Domino,
  end: 'left' | 'right' | 'any',
  chain: Domino[]
): Domino => {
  // First domino doesn't need to be flipped
  if (chain.length === 0) {
    return domino;
  }
  
  // Get the pips at the end where we want to place the domino
  const endPips = end === 'left' ? chain[0].leftPips : chain[chain.length - 1].rightPips;
  
  // If right pips match the end, flip the domino
  if (domino.rightPips === endPips) {
    return {
      ...domino,
      leftPips: domino.rightPips,
      rightPips: domino.leftPips,
    };
  }
  
  // If left pips match or no match (which shouldn't happen if validated), keep as is
  return domino;
};

/**
 * Calculate the score for a player's remaining dominoes
 */
export const calculateScore = (dominoes: Domino[]): number => {
  return dominoes.reduce((sum, domino) => sum + domino.leftPips + domino.rightPips, 0);
};

/**
 * Determine the winner when a game is blocked
 */
export const determineBlockedGameWinner = (playerDominoes: Domino[][]): number => {
  let lowestScore = Infinity;
  let winnerIndex = -1;
  
  playerDominoes.forEach((dominoes, index) => {
    const score = calculateScore(dominoes);
    if (score < lowestScore) {
      lowestScore = score;
      winnerIndex = index;
    }
  });
  
  return winnerIndex;
};
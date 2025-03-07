import { Domino } from '../types/gameTypes';

/**
 * Validates that a domino chain is valid (each domino connects properly)
 */
export const isValidDominoChain = (chain: Domino[]): boolean => {
  // Empty chain is valid
  if (chain.length === 0) {
    return true;
  }
  
  // Single domino is valid
  if (chain.length === 1) {
    return true;
  }
  
  // Check each pair of adjacent dominoes
  for (let i = 0; i < chain.length - 1; i++) {
    const current = chain[i];
    const next = chain[i + 1];
    
    // If this is the first domino, check its right end
    if (i === 0) {
      if (current.rightPips !== next.leftPips) {
        return false;
      }
    }
    // For middle dominoes, check that the rightPips of the current match the leftPips of the next
    else {
      if (current.rightPips !== next.leftPips) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Gets the left and right end values of a domino chain
 */
export const getChainEnds = (chain: Domino[]): { leftEnd: number; rightEnd: number } => {
  if (chain.length === 0) {
    return { leftEnd: -1, rightEnd: -1 };
  }
  
  // For a single domino, the left and right ends are its pips
  if (chain.length === 1) {
    return { leftEnd: chain[0].leftPips, rightEnd: chain[0].rightPips };
  }
  
  // Otherwise, get the leftmost and rightmost pips
  return {
    leftEnd: chain[0].leftPips,
    rightEnd: chain[chain.length - 1].rightPips,
  };
};
import { Domino, GameState, Player } from '@/types/gameTypes';
import { validateDominoPlacement } from './dominoUtils';
import { sendDebug } from './apiService';

/**
 * Logs game state information to both console and server
 */
export const debugGameState = (state: GameState) => {
    // Format the state in a readable way
    const debugInfo = {
        gamePhase: state.gamePhase,
        currentPlayer: state.currentPlayer,
        playerInfo: state.players.map(player => ({
            id: player.id,
            name: player.name,
            dominoCount: player.dominoes.length,
            isAI: player.isAI,
        })),
        dominoChain: state.dominoChain.map((domino, index) => ({
            position: index,
            leftPips: domino.leftPips,
            rightPips: domino.rightPips,
        })),
        chainEnds: {
            leftEnd: state.dominoChain.length > 0 ? state.dominoChain[0].leftPips : null,
            rightEnd: state.dominoChain.length > 0 ? state.dominoChain[state.dominoChain.length - 1].rightPips : null,
        }
    };

    // Log to console
    console.log('Game State Debug:', debugInfo);

    // Also send to server
    sendDebug('gameState', debugInfo);

    return debugInfo;
};

/**
 * Analyzes playable dominoes for a player
 */
export const analyzePlayableDominoes = (state: GameState, player: Player) => {
    const playableDominoes = player.dominoes.map(domino => {
        const canPlayLeft = validateDominoPlacement(domino, 'left', state.dominoChain);
        const canPlayRight = validateDominoPlacement(domino, 'right', state.dominoChain);

        return {
            domino: { leftPips: domino.leftPips, rightPips: domino.rightPips },
            canPlayLeft,
            canPlayRight,
            canPlay: canPlayLeft || canPlayRight
        };
    });

    const analysis = {
        playerId: player.id,
        playerName: player.name,
        dominoCount: player.dominoes.length,
        playableDominoes,
        hasValidMove: playableDominoes.some(pd => pd.canPlay)
    };

    console.log('Player Analysis:', analysis);
    sendDebug('playerAnalysis', analysis);

    return analysis;
};

/**
 * Takes a "screenshot" by serializing the current DOM
 */
export const capturePageState = () => {
    if (typeof document === 'undefined') return null;

    const html = document.documentElement.outerHTML;
    console.log('Captured page DOM state');
    sendDebug('pageCapture', {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        title: document.title,
        snippet: html.substring(0, 5000) + '...' // Send just a part to avoid large payloads
    });

    return { success: true, timestamp: new Date().toISOString() };
};
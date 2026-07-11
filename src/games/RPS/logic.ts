export const PLAYER_1 = 1;
export const PLAYER_2 = 2;

export type Choice = 'rock' | 'paper' | 'scissors' | null;

export interface GameState {
  p1Score: number;
  p2Score: number;
  p1Choice: Choice;
  p2Choice: Choice;
  phase: 'choosing' | 'revealing' | 'roundEnd' | 'finished';
  round: number;
  winner: number | null; // Final winner of the game
  roundWinner: number | 'draw' | null;
}

export function createInitialState(): GameState {
  return {
    p1Score: 0,
    p2Score: 0,
    p1Choice: null,
    p2Choice: null,
    phase: 'choosing',
    round: 1,
    winner: null,
    roundWinner: null,
  };
}

export function resolveRound(p1Choice: Choice, p2Choice: Choice): number | 'draw' {
  if (p1Choice === p2Choice) return 'draw';
  if (
    (p1Choice === 'rock' && p2Choice === 'scissors') ||
    (p1Choice === 'paper' && p2Choice === 'rock') ||
    (p1Choice === 'scissors' && p2Choice === 'paper')
  ) {
    return PLAYER_1;
  }
  return PLAYER_2;
}

export function submitChoice(state: GameState, player: number, choice: Choice): GameState | null {
  if (state.phase !== 'choosing' || state.winner) return null;

  const newState = { ...state };
  if (player === PLAYER_1 && !newState.p1Choice) newState.p1Choice = choice;
  else if (player === PLAYER_2 && !newState.p2Choice) newState.p2Choice = choice;
  else return null; // Choice already submitted

  if (newState.p1Choice && newState.p2Choice) {
    newState.phase = 'revealing';
  }

  return newState;
}

export function processRoundEnd(state: GameState): GameState | null {
  if (state.phase !== 'revealing') return null;

  const newState = { ...state };
  const rWinner = resolveRound(newState.p1Choice, newState.p2Choice);
  newState.roundWinner = rWinner;

  if (rWinner === PLAYER_1) newState.p1Score++;
  else if (rWinner === PLAYER_2) newState.p2Score++;

  if (newState.p1Score >= 3) newState.winner = PLAYER_1;
  else if (newState.p2Score >= 3) newState.winner = PLAYER_2;
  
  newState.phase = newState.winner ? 'finished' : 'roundEnd';

  return newState;
}

export function nextRound(state: GameState): GameState | null {
  if (state.phase !== 'roundEnd') return null;
  return {
    ...state,
    phase: 'choosing',
    p1Choice: null,
    p2Choice: null,
    roundWinner: null,
    round: state.round + 1,
  };
}

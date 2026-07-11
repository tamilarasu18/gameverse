export const PLAYER_1 = 1;
export const PLAYER_2 = 2;

export type Choice = 1 | 2 | 3 | 4 | 5 | 6 | null;

export interface GameState {
  p1Score: number;
  p2Score: number;
  p1Choice: Choice;
  p2Choice: Choice;
  phase: 'choosing' | 'revealing' | 'roundEnd' | 'finished';
  batsman: number; // 1 or 2
  bowler: number;
  innings: 1 | 2;
  target: number | null;
  winner: number | 'draw' | null;
  lastOutcome: 'out' | 'runs' | null;
}

export function createInitialState(firstBat: number = PLAYER_1): GameState {
  return {
    p1Score: 0,
    p2Score: 0,
    p1Choice: null,
    p2Choice: null,
    phase: 'choosing',
    batsman: firstBat,
    bowler: firstBat === PLAYER_1 ? PLAYER_2 : PLAYER_1,
    innings: 1,
    target: null,
    winner: null,
    lastOutcome: null,
  };
}

export function submitChoice(state: GameState, player: number, choice: Choice): GameState | null {
  if (state.phase !== 'choosing' || state.winner) return null;

  const newState = { ...state };
  if (player === PLAYER_1 && !newState.p1Choice) newState.p1Choice = choice;
  else if (player === PLAYER_2 && !newState.p2Choice) newState.p2Choice = choice;
  else return null;

  if (newState.p1Choice && newState.p2Choice) {
    newState.phase = 'revealing';
  }

  return newState;
}

export function processRoundEnd(state: GameState): GameState | null {
  if (state.phase !== 'revealing') return null;

  const newState = { ...state };
  const bChoice = newState.batsman === PLAYER_1 ? newState.p1Choice : newState.p2Choice;
  const bwChoice = newState.bowler === PLAYER_1 ? newState.p1Choice : newState.p2Choice;

  let isOut = false;
  if (bChoice === bwChoice) {
    isOut = true;
    newState.lastOutcome = 'out';
  } else {
    newState.lastOutcome = 'runs';
    if (newState.batsman === PLAYER_1) newState.p1Score += (bChoice || 0);
    else newState.p2Score += (bChoice || 0);
  }

  if (newState.innings === 1) {
    if (isOut) {
      newState.innings = 2;
      newState.target = (newState.batsman === PLAYER_1 ? newState.p1Score : newState.p2Score) + 1;
      const temp = newState.batsman;
      newState.batsman = newState.bowler;
      newState.bowler = temp;
    }
  } else {
    const chasingScore = newState.batsman === PLAYER_1 ? newState.p1Score : newState.p2Score;
    if (chasingScore >= (newState.target || 0)) {
      newState.winner = newState.batsman;
    } else if (isOut) {
      const defendingScore = newState.bowler === PLAYER_1 ? newState.p1Score : newState.p2Score;
      if (chasingScore === defendingScore) newState.winner = 'draw';
      else newState.winner = newState.bowler;
    }
  }

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
    lastOutcome: null,
  };
}

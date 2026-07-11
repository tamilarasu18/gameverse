export const PLAYER_1 = 1;
export const PLAYER_2 = 2;

export interface GameState {
  horizontalLines: boolean[][];
  verticalLines: boolean[][];
  boxes: (number | null)[][];
  currentPlayer: number;
  scores: { [key: number]: number };
  winner: number | null;
  isDraw: boolean;
  moveCount: number;
}

export const DOTS_ROWS = 6;
export const DOTS_COLS = 6;
export const BOX_ROWS = DOTS_ROWS - 1;
export const BOX_COLS = DOTS_COLS - 1;

export function createInitialState(): GameState {
  return {
    horizontalLines: Array(DOTS_ROWS).fill(null).map(() => Array(BOX_COLS).fill(false)),
    verticalLines: Array(BOX_ROWS).fill(null).map(() => Array(DOTS_COLS).fill(false)),
    boxes: Array(BOX_ROWS).fill(null).map(() => Array(BOX_COLS).fill(null)),
    currentPlayer: PLAYER_1,
    scores: { [PLAYER_1]: 0, [PLAYER_2]: 0 },
    winner: null,
    isDraw: false,
    moveCount: 0,
  };
}

// Draw a line and return the new state. Returns null if invalid.
export function drawLine(
  state: GameState,
  type: 'h' | 'v',
  r: number,
  c: number,
  player: number
): GameState | null {
  if (state.winner || state.isDraw) return null;
  if (type === 'h' && state.horizontalLines[r][c]) return null;
  if (type === 'v' && state.verticalLines[r][c]) return null;

  const newState = {
    ...state,
    horizontalLines: state.horizontalLines.map(row => [...row]),
    verticalLines: state.verticalLines.map(row => [...row]),
    boxes: state.boxes.map(row => [...row]),
    scores: { ...state.scores },
  };

  if (type === 'h') newState.horizontalLines[r][c] = true;
  else newState.verticalLines[r][c] = true;

  newState.moveCount += 1;

  // Check for completed boxes
  let completedBoxes = 0;

  // Helper to check a specific box
  const checkAndClaimBox = (br: number, bc: number) => {
    if (br >= 0 && br < BOX_ROWS && bc >= 0 && bc < BOX_COLS) {
      if (
        newState.boxes[br][bc] === null &&
        newState.horizontalLines[br][bc] && // top
        newState.horizontalLines[br + 1][bc] && // bottom
        newState.verticalLines[br][bc] && // left
        newState.verticalLines[br][bc + 1] // right
      ) {
        newState.boxes[br][bc] = player;
        completedBoxes++;
        newState.scores[player]++;
      }
    }
  };

  if (type === 'h') {
    checkAndClaimBox(r - 1, c); // Box above
    checkAndClaimBox(r, c);     // Box below
  } else {
    checkAndClaimBox(r, c - 1); // Box left
    checkAndClaimBox(r, c);     // Box right
  }

  if (completedBoxes === 0) {
    // Switch turn if no box completed
    newState.currentPlayer = player === PLAYER_1 ? PLAYER_2 : PLAYER_1;
  }

  // Check for game end
  let allFull = true;
  for (let br = 0; br < BOX_ROWS; br++) {
    for (let bc = 0; bc < BOX_COLS; bc++) {
      if (newState.boxes[br][bc] === null) {
        allFull = false;
        break;
      }
    }
  }

  if (allFull) {
    if (newState.scores[PLAYER_1] > newState.scores[PLAYER_2]) newState.winner = PLAYER_1;
    else if (newState.scores[PLAYER_2] > newState.scores[PLAYER_1]) newState.winner = PLAYER_2;
    else newState.isDraw = true;
  }

  return newState;
}

// Connect Four - Pure Game Logic (no UI)

const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

// Create an empty board
export function createBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
}

// Find the lowest empty row in a column
export function getAvailableRow(board: number[][], col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) return row;
  }
  return -1; // Column is full
}

// Drop a piece into a column, returns new board or null if invalid
export function dropPiece(board: number[][], col: number, player: number): number[][] | null {
  const row = getAvailableRow(board, col);
  if (row === -1) return null;

  const newBoard = board.map(r => [...r]);
  newBoard[row][col] = player;
  return newBoard;
}

// Check for a winner, returns { winner, cells } or null
export function checkWinner(board: number[][]): { winner: number, cells: number[][] } | null {
  // Horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const val = board[row][col];
      if (val !== EMPTY &&
          val === board[row][col+1] &&
          val === board[row][col+2] &&
          val === board[row][col+3]) {
        return {
          winner: val,
          cells: [[row,col], [row,col+1], [row,col+2], [row,col+3]]
        };
      }
    }
  }

  // Vertical
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col < COLS; col++) {
      const val = board[row][col];
      if (val !== EMPTY &&
          val === board[row+1][col] &&
          val === board[row+2][col] &&
          val === board[row+3][col]) {
        return {
          winner: val,
          cells: [[row,col], [row+1,col], [row+2,col], [row+3,col]]
        };
      }
    }
  }

  // Diagonal (down-right)
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const val = board[row][col];
      if (val !== EMPTY &&
          val === board[row+1][col+1] &&
          val === board[row+2][col+2] &&
          val === board[row+3][col+3]) {
        return {
          winner: val,
          cells: [[row,col], [row+1,col+1], [row+2,col+2], [row+3,col+3]]
        };
      }
    }
  }

  // Diagonal (down-left)
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 3; col < COLS; col++) {
      const val = board[row][col];
      if (val !== EMPTY &&
          val === board[row+1][col-1] &&
          val === board[row+2][col-2] &&
          val === board[row+3][col-3]) {
        return {
          winner: val,
          cells: [[row,col], [row+1,col-1], [row+2,col-2], [row+3,col-3]]
        };
      }
    }
  }

  return null;
}

// Check if board is completely full (draw)
export function isBoardFull(board: number[][]): boolean {
  return board[0].every(cell => cell !== EMPTY);
}

export { ROWS, COLS, EMPTY, PLAYER_1, PLAYER_2 };

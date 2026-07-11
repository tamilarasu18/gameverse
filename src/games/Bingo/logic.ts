export interface CellState {
  number: number | null;
  marked: boolean;
}

export type BoardState = CellState[][];

// Generate an empty 5x5 board
export function generateEmptyBoard(): BoardState {
  return Array(5).fill(null).map(() => 
    Array(5).fill(null).map(() => ({ number: null, marked: false }))
  );
}

// Check if a board has completed lines (horizontal, vertical, diagonal)
// A player needs 5 lines (strikes) to spell B-I-N-G-O and win.
export function checkWinner(board: BoardState): { isWinner: boolean; winningCells: [number, number][] | null; strikes: number } {
  const winningCells: [number, number][] = [];
  let strikes = 0;

  // Check rows
  for (let r = 0; r < 5; r++) {
    if (board[r].every(cell => cell.marked)) {
      strikes++;
      board[r].forEach((_, c) => winningCells.push([r, c]));
    }
  }

  // Check columns
  for (let c = 0; c < 5; c++) {
    if (board.every(row => row[c].marked)) {
      strikes++;
      board.forEach((_, r) => winningCells.push([r, c]));
    }
  }

  // Check diagonals
  const diag1 = [0, 1, 2, 3, 4].map(i => board[i][i]);
  if (diag1.every(cell => cell.marked)) {
    strikes++;
    [0, 1, 2, 3, 4].forEach(i => winningCells.push([i, i]));
  }

  const diag2 = [0, 1, 2, 3, 4].map(i => board[i][4 - i]);
  if (diag2.every(cell => cell.marked)) {
    strikes++;
    [0, 1, 2, 3, 4].forEach(i => winningCells.push([i, 4 - i]));
  }

  return { 
    isWinner: strikes >= 5, 
    winningCells: strikes > 0 ? winningCells : null,
    strikes 
  };
}

// Mark a specific number on the board if it exists
export function markNumber(board: BoardState, num: number): BoardState {
  return board.map(row => 
    row.map(cell => 
      cell.number === num ? { ...cell, marked: true } : cell
    )
  );
}

// Place a number at a specific row/col
export function placeNumber(board: BoardState, row: number, col: number, num: number): BoardState {
  return board.map((r, rIdx) => 
    r.map((cell, cIdx) => 
      (rIdx === row && cIdx === col) ? { ...cell, number: num } : cell
    )
  );
}

// Check if board is fully populated (all 25 numbers placed)
export function isBoardFull(board: BoardState): boolean {
  return board.every(row => row.every(cell => cell.number !== null));
}

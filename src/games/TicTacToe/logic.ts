export const PLAYER_1 = 1;
export const PLAYER_2 = 2;

export function createBoard(): (number | null)[] {
  return Array(9).fill(null);
}

export function checkWinner(board: (number | null)[]): { winner: number; cells: number[] } | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a]!, cells: [a, b, c] };
    }
  }
  return null;
}

export function isBoardFull(board: (number | null)[]): boolean {
  return board.every(cell => cell !== null);
}

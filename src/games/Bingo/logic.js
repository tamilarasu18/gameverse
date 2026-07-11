// Bingo - Pure Game Logic

const HEADERS = ['B', 'I', 'N', 'G', 'O'];
const RANGES = [
  [1, 15],   // B
  [16, 30],  // I
  [31, 45],  // N
  [46, 60],  // G
  [61, 75],  // O
];

// Generate a random bingo board
export function generateBoard() {
  const board = [];
  for (let row = 0; row < 5; row++) {
    const rowData = [];
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        // FREE space
        rowData.push({ number: 'FREE', marked: true });
      } else {
        const [min, max] = RANGES[col];
        let num;
        do {
          num = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (rowData.some(c => c.number === num) ||
                 board.some(r => r[col] && r[col].number === num));
        rowData.push({ number: num, marked: false });
      }
    }
    board.push(rowData);
  }
  return board;
}

// Generate the full sequence of numbers to call (1-75 shuffled)
export function generateCallSequence() {
  const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

// Get the header letter for a number
export function getHeaderForNumber(num) {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
}

// Check if a board matches any variation of a pattern
export function checkPattern(board, pattern) {
  const markedGrid = board.map(row =>
    row.map(cell => cell.marked)
  );

  // Check against all pattern grid variations
  for (const grid of pattern.grids) {
    let matches = true;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (grid[r][c] && !markedGrid[r][c]) {
          matches = false;
          break;
        }
      }
      if (!matches) break;
    }
    if (matches) return true;
  }

  return false;
}

// Mark a number on a board (if it exists)
export function markNumber(board, number) {
  return board.map(row =>
    row.map(cell => {
      if (cell.number === number) {
        return { ...cell, marked: true };
      }
      return cell;
    })
  );
}

export { HEADERS, RANGES };

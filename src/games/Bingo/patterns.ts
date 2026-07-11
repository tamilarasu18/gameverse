// Bingo Pattern Definitions
// Each pattern is a 5x5 boolean grid where true means the cell must be marked

export const PATTERNS = {
  horizontal_line: {
    name: 'Horizontal Line',
    icon: '➖',
    description: 'Complete any horizontal row',
    grids: [
      // Any of the 5 rows
      [
        [true, true, true, true, true],
        [false,false,false,false,false],
        [false,false,false,false,false],
        [false,false,false,false,false],
        [false,false,false,false,false],
      ],
      [
        [false,false,false,false,false],
        [true, true, true, true, true],
        [false,false,false,false,false],
        [false,false,false,false,false],
        [false,false,false,false,false],
      ],
      [
        [false,false,false,false,false],
        [false,false,false,false,false],
        [true, true, true, true, true],
        [false,false,false,false,false],
        [false,false,false,false,false],
      ],
      [
        [false,false,false,false,false],
        [false,false,false,false,false],
        [false,false,false,false,false],
        [true, true, true, true, true],
        [false,false,false,false,false],
      ],
      [
        [false,false,false,false,false],
        [false,false,false,false,false],
        [false,false,false,false,false],
        [false,false,false,false,false],
        [true, true, true, true, true],
      ]
    ]
  },

  vertical_line: {
    name: 'Vertical Line',
    icon: '|',
    description: 'Complete any vertical column',
    grids: [
      Array(5).fill(null).map(() => [true, false, false, false, false]),
      Array(5).fill(null).map(() => [false, true, false, false, false]),
      Array(5).fill(null).map(() => [false, false, true, false, false]),
      Array(5).fill(null).map(() => [false, false, false, true, false]),
      Array(5).fill(null).map(() => [false, false, false, false, true]),
    ]
  },

  diagonal: {
    name: 'Diagonal',
    icon: '╲',
    description: 'Complete a diagonal line',
    grids: [
      [
        [true, false,false,false,false],
        [false,true, false,false,false],
        [false,false,true, false,false],
        [false,false,false,true, false],
        [false,false,false,false,true],
      ],
      [
        [false,false,false,false,true],
        [false,false,false,true, false],
        [false,false,true, false,false],
        [false,true, false,false,false],
        [true, false,false,false,false],
      ]
    ]
  },

  four_corners: {
    name: 'Four Corners',
    icon: '◇',
    description: 'Mark all four corners',
    grids: [
      [
        [true, false,false,false,true],
        [false,false,false,false,false],
        [false,false,false,false,false],
        [false,false,false,false,false],
        [true, false,false,false,true],
      ]
    ]
  },

  x_pattern: {
    name: 'X Pattern',
    icon: '✕',
    description: 'Mark both diagonals to form an X',
    grids: [
      [
        [true, false,false,false,true],
        [false,true, false,true, false],
        [false,false,true, false,false],
        [false,true, false,true, false],
        [true, false,false,false,true],
      ]
    ]
  },

  t_shape: {
    name: 'T Shape',
    icon: '⊤',
    description: 'Complete the T pattern',
    grids: [
      [
        [true, true, true, true, true],
        [false,false,true, false,false],
        [false,false,true, false,false],
        [false,false,true, false,false],
        [false,false,true, false,false],
      ]
    ]
  },

  diamond: {
    name: 'Diamond',
    icon: '◆',
    description: 'Complete the diamond shape',
    grids: [
      [
        [false,false,true, false,false],
        [false,true, false,true, false],
        [true, false,false,false,true],
        [false,true, false,true, false],
        [false,false,true, false,false],
      ]
    ]
  },

  plus_sign: {
    name: 'Plus Sign',
    icon: '✚',
    description: 'Complete the plus pattern',
    grids: [
      [
        [false,false,true, false,false],
        [false,false,true, false,false],
        [true, true, true, true, true],
        [false,false,true, false,false],
        [false,false,true, false,false],
      ]
    ]
  },

  frame: {
    name: 'Frame',
    icon: '□',
    description: 'Complete the border frame',
    grids: [
      [
        [true, true, true, true, true],
        [true, false,false,false,true],
        [true, false,false,false,true],
        [true, false,false,false,true],
        [true, true, true, true, true],
      ]
    ]
  },

  blackout: {
    name: 'Blackout',
    icon: '■',
    description: 'Mark every single cell!',
    grids: [
      Array(5).fill(null).map(() => [true, true, true, true, true])
    ]
  }
};

// Get a random pattern for gameplay
export function getRandomPattern(excludeId?: string) {
  const keys = Object.keys(PATTERNS).filter(k => k !== excludeId && k !== 'blackout');
  const key = keys[Math.floor(Math.random() * keys.length)] as keyof typeof PATTERNS;
  return { id: key, ...PATTERNS[key] };
}

// Get pattern display grid (use first grid for display, any grid matches for checking)
export function getPatternDisplayGrid(patternId: string) {
  const pattern = PATTERNS[patternId as keyof typeof PATTERNS];
  if (!pattern) return null;
  return pattern.grids[0];
}

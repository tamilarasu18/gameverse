export const PLAYER_1 = 1;
export const PLAYER_2 = 2;

export interface Position {
  r: number;
  c: number;
}

export interface Wall {
  type: 'h' | 'v'; // h = horizontal, v = vertical
  r: number;
  c: number;
}

export interface GameState {
  p1Pos: Position;
  p2Pos: Position;
  p1Walls: number;
  p2Walls: number;
  walls: Wall[];
  currentPlayer: number;
  winner: number | null;
  moveCount: number;
}

export const BOARD_SIZE = 9;
export const MAX_WALLS = 10;

export function createInitialState(): GameState {
  return {
    p1Pos: { r: 0, c: 4 }, // Starts top, needs to reach bottom (8)
    p2Pos: { r: 8, c: 4 }, // Starts bottom, needs to reach top (0)
    p1Walls: MAX_WALLS,
    p2Walls: MAX_WALLS,
    walls: [],
    currentPlayer: PLAYER_1,
    winner: null,
    moveCount: 0,
  };
}

// Checks if a cell is blocked in a specific direction by a wall
export function isBlocked(pos: Position, dir: 'up' | 'down' | 'left' | 'right', walls: Wall[]): boolean {
  for (const w of walls) {
    if (dir === 'down') {
      // Horizontal wall at (r, c) blocks going down from (r, c) and (r, c+1)
      if (w.type === 'h' && w.r === pos.r && (w.c === pos.c || w.c === pos.c - 1)) return true;
    }
    if (dir === 'up') {
      // Horizontal wall at (r-1, c) blocks going up from (r, c) and (r, c+1)
      if (w.type === 'h' && w.r === pos.r - 1 && (w.c === pos.c || w.c === pos.c - 1)) return true;
    }
    if (dir === 'right') {
      // Vertical wall at (r, c) blocks going right from (r, c) and (r+1, c)
      if (w.type === 'v' && w.c === pos.c && (w.r === pos.r || w.r === pos.r - 1)) return true;
    }
    if (dir === 'left') {
      // Vertical wall at (r, c-1) blocks going left from (r, c) and (r+1, c)
      if (w.type === 'v' && w.c === pos.c - 1 && (w.r === pos.r || w.r === pos.r - 1)) return true;
    }
  }
  return false;
}

// Gets valid adjacent moves, taking into account walls and the other player (jumping)
export function getValidMoves(state: GameState, player: number): Position[] {
  const pos = player === PLAYER_1 ? state.p1Pos : state.p2Pos;
  const oppPos = player === PLAYER_1 ? state.p2Pos : state.p1Pos;
  const valid: Position[] = [];

  const addMove = (r: number, c: number) => {
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) valid.push({ r, c });
  };

  // Up
  if (pos.r > 0 && !isBlocked(pos, 'up', state.walls)) {
    if (pos.r - 1 === oppPos.r && pos.c === oppPos.c) { // Jump
      if (oppPos.r > 0 && !isBlocked(oppPos, 'up', state.walls)) addMove(pos.r - 2, pos.c);
      else {
        // Diagonal jump if blocked straight
        if (oppPos.c > 0 && !isBlocked(oppPos, 'left', state.walls)) addMove(oppPos.r, oppPos.c - 1);
        if (oppPos.c < BOARD_SIZE - 1 && !isBlocked(oppPos, 'right', state.walls)) addMove(oppPos.r, oppPos.c + 1);
      }
    } else addMove(pos.r - 1, pos.c);
  }
  // Down
  if (pos.r < BOARD_SIZE - 1 && !isBlocked(pos, 'down', state.walls)) {
    if (pos.r + 1 === oppPos.r && pos.c === oppPos.c) { // Jump
      if (oppPos.r < BOARD_SIZE - 1 && !isBlocked(oppPos, 'down', state.walls)) addMove(pos.r + 2, pos.c);
      else {
        if (oppPos.c > 0 && !isBlocked(oppPos, 'left', state.walls)) addMove(oppPos.r, oppPos.c - 1);
        if (oppPos.c < BOARD_SIZE - 1 && !isBlocked(oppPos, 'right', state.walls)) addMove(oppPos.r, oppPos.c + 1);
      }
    } else addMove(pos.r + 1, pos.c);
  }
  // Left
  if (pos.c > 0 && !isBlocked(pos, 'left', state.walls)) {
    if (pos.r === oppPos.r && pos.c - 1 === oppPos.c) { // Jump
      if (oppPos.c > 0 && !isBlocked(oppPos, 'left', state.walls)) addMove(pos.r, pos.c - 2);
      else {
        if (oppPos.r > 0 && !isBlocked(oppPos, 'up', state.walls)) addMove(oppPos.r - 1, oppPos.c);
        if (oppPos.r < BOARD_SIZE - 1 && !isBlocked(oppPos, 'down', state.walls)) addMove(oppPos.r + 1, oppPos.c);
      }
    } else addMove(pos.r, pos.c - 1);
  }
  // Right
  if (pos.c < BOARD_SIZE - 1 && !isBlocked(pos, 'right', state.walls)) {
    if (pos.r === oppPos.r && pos.c + 1 === oppPos.c) { // Jump
      if (oppPos.c < BOARD_SIZE - 1 && !isBlocked(oppPos, 'right', state.walls)) addMove(pos.r, pos.c + 2);
      else {
        if (oppPos.r > 0 && !isBlocked(oppPos, 'up', state.walls)) addMove(oppPos.r - 1, oppPos.c);
        if (oppPos.r < BOARD_SIZE - 1 && !isBlocked(oppPos, 'down', state.walls)) addMove(oppPos.r + 1, oppPos.c);
      }
    } else addMove(pos.r, pos.c + 1);
  }

  return valid;
}

// BFS to check if a player can reach their goal row
export function hasPathToGoal(pos: Position, goalRow: number, walls: Wall[]): boolean {
  const queue: Position[] = [pos];
  const visited = new Set<string>();
  visited.add(`${pos.r},${pos.c}`);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.r === goalRow) return true;

    // We don't need to consider opponent jumping for basic pathfinding reachability,
    // just orthogonal steps that aren't blocked by walls.
    const neighbors: { r: number, c: number, dir: 'up' | 'down' | 'left' | 'right' }[] = [
      { r: curr.r - 1, c: curr.c, dir: 'up' },
      { r: curr.r + 1, c: curr.c, dir: 'down' },
      { r: curr.r, c: curr.c - 1, dir: 'left' },
      { r: curr.r, c: curr.c + 1, dir: 'right' },
    ];

    for (const n of neighbors) {
      if (n.r >= 0 && n.r < BOARD_SIZE && n.c >= 0 && n.c < BOARD_SIZE) {
        if (!isBlocked(curr, n.dir, walls)) {
          const key = `${n.r},${n.c}`;
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({ r: n.r, c: n.c });
          }
        }
      }
    }
  }
  return false;
}

export function movePawn(state: GameState, player: number, r: number, c: number): GameState | null {
  if (state.winner || state.currentPlayer !== player) return null;

  const validMoves = getValidMoves(state, player);
  if (!validMoves.some(m => m.r === r && m.c === c)) return null;

  const newState = { ...state };
  if (player === PLAYER_1) newState.p1Pos = { r, c };
  else newState.p2Pos = { r, c };

  newState.moveCount++;
  newState.currentPlayer = player === PLAYER_1 ? PLAYER_2 : PLAYER_1;

  if (newState.p1Pos.r === 8) newState.winner = PLAYER_1;
  else if (newState.p2Pos.r === 0) newState.winner = PLAYER_2;

  return newState;
}

export function placeWall(state: GameState, player: number, type: 'h' | 'v', r: number, c: number): GameState | null {
  if (state.winner || state.currentPlayer !== player) return null;
  if (player === PLAYER_1 && state.p1Walls <= 0) return null;
  if (player === PLAYER_2 && state.p2Walls <= 0) return null;

  // Invalid coordinates for a wall
  if (r < 0 || r >= BOARD_SIZE - 1 || c < 0 || c >= BOARD_SIZE - 1) return null;

  // Check overlap with existing walls
  for (const w of state.walls) {
    if (w.r === r && w.c === c) return null; // Can't intersect directly in the middle
    if (w.type === type && w.r === r && Math.abs(w.c - c) === 1 && type === 'h') return null; // Can't overlap horizontally
    if (w.type === type && w.c === c && Math.abs(w.r - r) === 1 && type === 'v') return null; // Can't overlap vertically
  }

  // Check path validity (must leave a path for both players)
  const simulatedWalls = [...state.walls, { type, r, c }];
  if (!hasPathToGoal(state.p1Pos, 8, simulatedWalls)) return null;
  if (!hasPathToGoal(state.p2Pos, 0, simulatedWalls)) return null;

  const newState = { ...state, walls: simulatedWalls };
  if (player === PLAYER_1) newState.p1Walls--;
  else newState.p2Walls--;

  newState.moveCount++;
  newState.currentPlayer = player === PLAYER_1 ? PLAYER_2 : PLAYER_1;

  return newState;
}

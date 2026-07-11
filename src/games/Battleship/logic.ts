export const PLAYER_1 = 1;
export const PLAYER_2 = 2;

export const BOARD_SIZE = 10;

export interface ShipDef {
  id: string;
  name: string;
  length: number;
}

export const SHIPS: ShipDef[] = [
  { id: 'carrier', name: 'Carrier', length: 5 },
  { id: 'battleship', name: 'Battleship', length: 4 },
  { id: 'cruiser', name: 'Cruiser', length: 3 },
  { id: 'submarine', name: 'Submarine', length: 3 },
  { id: 'destroyer', name: 'Destroyer', length: 2 },
];

export interface ShipPlacement {
  id: string;
  r: number;
  c: number;
  isVertical: boolean;
  length: number;
  hits: number;
}

export interface Shot {
  r: number;
  c: number;
  result: 'hit' | 'miss' | 'sunk';
  shipId?: string;
}

export interface PendingShot {
  player: number;
  r: number;
  c: number;
  id: string;
}

export interface SharedGameState {
  phase: 'placement' | 'combat' | 'finished';
  p1Ready: boolean;
  p2Ready: boolean;
  currentPlayer: number;
  p1Shots: Shot[];
  p2Shots: Shot[];
  pendingShot: PendingShot | null;
  winner: number | null;
}

export function createInitialSharedState(): SharedGameState {
  return {
    phase: 'placement',
    p1Ready: false,
    p2Ready: false,
    currentPlayer: PLAYER_1,
    p1Shots: [],
    p2Shots: [],
    pendingShot: null,
    winner: null,
  };
}

export function isValidPlacement(placement: ShipPlacement, otherShips: ShipPlacement[]): boolean {
  // Check bounds
  if (placement.r < 0 || placement.c < 0) return false;
  if (placement.isVertical && placement.r + placement.length > BOARD_SIZE) return false;
  if (!placement.isVertical && placement.c + placement.length > BOARD_SIZE) return false;

  // Check overlap
  const getCells = (p: ShipPlacement) => {
    const cells = [];
    for (let i = 0; i < p.length; i++) {
      cells.push(p.isVertical ? `${p.r + i},${p.c}` : `${p.r},${p.c + i}`);
    }
    return cells;
  };

  const newCells = getCells(placement);
  for (const other of otherShips) {
    if (other.id === placement.id) continue;
    const existingCells = getCells(other);
    if (newCells.some(c => existingCells.includes(c))) return false;
  }

  return true;
}

export function generateRandomPlacements(): ShipPlacement[] {
  const placements: ShipPlacement[] = [];
  for (const ship of SHIPS) {
    let placed = false;
    while (!placed) {
      const isVertical = Math.random() > 0.5;
      const r = Math.floor(Math.random() * (isVertical ? BOARD_SIZE - ship.length + 1 : BOARD_SIZE));
      const c = Math.floor(Math.random() * (isVertical ? BOARD_SIZE : BOARD_SIZE - ship.length + 1));
      
      const newPlacement: ShipPlacement = { id: ship.id, r, c, isVertical, length: ship.length, hits: 0 };
      if (isValidPlacement(newPlacement, placements)) {
        placements.push(newPlacement);
        placed = true;
      }
    }
  }
  return placements;
}

export function checkShotResult(r: number, c: number, ships: ShipPlacement[]): { result: 'hit' | 'miss' | 'sunk', shipId?: string, updatedShips: ShipPlacement[] } {
  const newShips = JSON.parse(JSON.stringify(ships)) as ShipPlacement[];
  
  for (const ship of newShips) {
    let isHit = false;
    for (let i = 0; i < ship.length; i++) {
      const sr = ship.isVertical ? ship.r + i : ship.r;
      const sc = ship.isVertical ? ship.c : ship.c + i;
      if (sr === r && sc === c) {
        isHit = true;
        break;
      }
    }

    if (isHit) {
      ship.hits += 1;
      const isSunk = ship.hits >= ship.length;
      return {
        result: isSunk ? 'sunk' : 'hit',
        shipId: ship.id,
        updatedShips: newShips
      };
    }
  }

  return { result: 'miss', updatedShips: newShips };
}

export function isGameOver(ships: ShipPlacement[]): boolean {
  return ships.every(s => s.hits >= s.length);
}

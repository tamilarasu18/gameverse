import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { GameState, BOARD_SIZE, PLAYER_1, getValidMoves } from './logic';
import { useTheme } from '../../context/ThemeContext';
import { gameColors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const BOARD_DIMENSION = Math.min(width - 16, 400);
const CELL_SIZE = (BOARD_DIMENSION - (BOARD_SIZE + 1) * 4) / BOARD_SIZE;
const WALL_WIDTH = 4;

interface BoardProps {
  state: GameState;
  onMoveClick: (r: number, c: number) => void;
  onWallClick: (type: 'h' | 'v', r: number, c: number) => void;
  disabled: boolean;
  myPlayer: number;
}

export default function Board({ state, onMoveClick, onWallClick, disabled, myPlayer }: BoardProps) {
  const { colors } = useTheme();
  
  // Calculate valid moves if it's my turn
  const validMoves = (!disabled && state.currentPlayer === myPlayer) 
    ? getValidMoves(state, myPlayer) 
    : [];

  const isValidMove = (r: number, c: number) => validMoves.some(m => m.r === r && m.c === c);

  return (
    <View style={[styles.container, { width: BOARD_DIMENSION, height: BOARD_DIMENSION, backgroundColor: colors.boardBgDark }]}>
      {/* Cells */}
      {Array(BOARD_SIZE).fill(null).map((_, r) =>
        Array(BOARD_SIZE).fill(null).map((_, c) => {
          const isP1 = state.p1Pos.r === r && state.p1Pos.c === c;
          const isP2 = state.p2Pos.r === r && state.p2Pos.c === c;
          const isValid = isValidMove(r, c);

          return (
            <TouchableOpacity
              key={`cell-${r}-${c}`}
              disabled={disabled || (!isValid && !isP1 && !isP2)}
              onPress={() => onMoveClick(r, c)}
              activeOpacity={0.8}
              style={[
                styles.cell,
                {
                  left: c * (CELL_SIZE + WALL_WIDTH) + WALL_WIDTH,
                  top: r * (CELL_SIZE + WALL_WIDTH) + WALL_WIDTH,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: isValid ? colors.boardBg : colors.boardCell,
                }
              ]}
            >
              {isP1 && <View style={[styles.pawn, { backgroundColor: gameColors.discRed }]} />}
              {isP2 && <View style={[styles.pawn, { backgroundColor: gameColors.discYellow }]} />}
            </TouchableOpacity>
          );
        })
      )}

      {/* Placed Walls */}
      {state.walls.map((w, idx) => {
        if (w.type === 'h') {
          return (
            <View
              key={`wall-placed-h-${idx}`}
              style={[
                styles.wallPlaced,
                { backgroundColor: colors.accentPrimary },
                {
                  left: w.c * (CELL_SIZE + WALL_WIDTH) + WALL_WIDTH,
                  top: w.r * (CELL_SIZE + WALL_WIDTH) + CELL_SIZE + WALL_WIDTH,
                  width: CELL_SIZE * 2 + WALL_WIDTH,
                  height: WALL_WIDTH,
                }
              ]}
            />
          );
        } else {
          return (
            <View
              key={`wall-placed-v-${idx}`}
              style={[
                styles.wallPlaced,
                { backgroundColor: colors.accentPrimary },
                {
                  left: w.c * (CELL_SIZE + WALL_WIDTH) + CELL_SIZE + WALL_WIDTH,
                  top: w.r * (CELL_SIZE + WALL_WIDTH) + WALL_WIDTH,
                  width: WALL_WIDTH,
                  height: CELL_SIZE * 2 + WALL_WIDTH,
                }
              ]}
            />
          );
        }
      })}

      {/* Wall Placement Zones (Horizontal) */}
      {!disabled && state.currentPlayer === myPlayer && Array(BOARD_SIZE - 1).fill(null).map((_, r) =>
        Array(BOARD_SIZE - 1).fill(null).map((_, c) => (
          <TouchableOpacity
            key={`wall-zone-h-${r}-${c}`}
            onPress={() => onWallClick('h', r, c)}
            activeOpacity={0.5}
            style={[
              styles.wallZoneH,
              {
                left: c * (CELL_SIZE + WALL_WIDTH) + WALL_WIDTH + CELL_SIZE / 2,
                top: r * (CELL_SIZE + WALL_WIDTH) + CELL_SIZE,
                width: CELL_SIZE + WALL_WIDTH,
                height: WALL_WIDTH * 3, // thicker touch area
              }
            ]}
          >
            <View style={[styles.wallHover, { height: WALL_WIDTH, backgroundColor: colors.glassBorder }]} />
          </TouchableOpacity>
        ))
      )}

      {/* Wall Placement Zones (Vertical) */}
      {!disabled && state.currentPlayer === myPlayer && Array(BOARD_SIZE - 1).fill(null).map((_, r) =>
        Array(BOARD_SIZE - 1).fill(null).map((_, c) => (
          <TouchableOpacity
            key={`wall-zone-v-${r}-${c}`}
            onPress={() => onWallClick('v', r, c)}
            activeOpacity={0.5}
            style={[
              styles.wallZoneV,
              {
                left: c * (CELL_SIZE + WALL_WIDTH) + CELL_SIZE,
                top: r * (CELL_SIZE + WALL_WIDTH) + WALL_WIDTH + CELL_SIZE / 2,
                width: WALL_WIDTH * 3, // thicker touch area
                height: CELL_SIZE + WALL_WIDTH,
              }
            ]}
          >
            <View style={[styles.wallHover, { width: WALL_WIDTH, backgroundColor: colors.glassBorder }]} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawn: {
    width: '70%',
    height: '70%',
    borderRadius: 99,
  },
  wallPlaced: {
    position: 'absolute',
    zIndex: 10,
    borderRadius: 2,
  },
  wallZoneH: {
    position: 'absolute',
    zIndex: 20,
    justifyContent: 'center',
  },
  wallZoneV: {
    position: 'absolute',
    zIndex: 20,
    alignItems: 'center',
  },
  wallHover: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
});

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { gameColors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';

interface BoardProps {
  board: number[][];
  onColumnClick: (col: number) => void;
  winningCells: number[][] | null;
  disabled: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_PADDING = 12;
const CELL_GAP = 6;
const BOARD_MAX_WIDTH = Math.min(SCREEN_WIDTH - 48, 420);
const CELL_SIZE = Math.floor((BOARD_MAX_WIDTH - BOARD_PADDING * 2 - CELL_GAP * 6) / 7);

export default function Board({ board, onColumnClick, winningCells, disabled }: BoardProps) {
  const { colors } = useTheme();

  const isWinningCell = (row: number, col: number): boolean => {
    if (!winningCells) return false;
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  const getDiscColor = (cell: number) => {
    if (cell === 1) return gameColors.discRed;
    if (cell === 2) return gameColors.discYellow;
    return 'transparent';
  };

  return (
    <View style={[styles.boardOuter, { backgroundColor: colors.boardBg }]}>
      <View style={styles.board}>
        {Array.from({ length: 7 }, (_, col) => (
          <TouchableOpacity
            key={col}
            onPress={() => onColumnClick(col)}
            disabled={disabled}
            activeOpacity={0.7}
            style={styles.column}
            accessibilityLabel={`Column ${col + 1}`}
          >
            {Array.from({ length: 6 }, (_, row) => {
              const cell = board[row][col];
              const isWin = isWinningCell(row, col);

              return (
                <View key={row} style={[styles.cellOuter, { backgroundColor: colors.boardCell }]}>
                  {cell !== 0 && (
                    <View
                      style={[
                        styles.disc,
                        {
                          backgroundColor: getDiscColor(cell),
                          shadowColor: cell === 1 ? gameColors.discRedGlow : gameColors.discYellowGlow,
                        },
                        isWin && styles.discWin,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardOuter: {
    borderRadius: radius['2xl'],
    padding: BOARD_PADDING,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  board: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  column: {
    gap: CELL_GAP,
  },
  cellOuter: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: CELL_SIZE - 8,
    height: CELL_SIZE - 8,
    borderRadius: (CELL_SIZE - 8) / 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  discWin: {
    transform: [{ scale: 1.08 }],
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
});

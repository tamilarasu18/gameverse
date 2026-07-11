import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fonts } from '../../theme/typography';
import { BoardState } from './logic';

interface BingoBoardProps {
  board: BoardState;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
  winningCells?: [number, number][] | null;
  highlightNumber?: number | null; // number currently being called
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 48, 340);
const CELL_SIZE = Math.floor((BOARD_SIZE - spacing.sm * 4) / 5);

export default function BingoBoard({ board, onCellClick, disabled, winningCells, highlightNumber }: BingoBoardProps) {
  const { colors } = useTheme();

  const isWinningCell = (row: number, col: number) => {
    return winningCells?.some(([r, c]) => r === row && c === col);
  };

  return (
    <View style={[styles.boardWrap, { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder }]}>
      <View style={styles.grid}>
        {board.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => {
              const isWin = isWinningCell(r, c);
              const isHighlighted = highlightNumber === cell.number && cell.number !== null;

              let bgColor = colors.bgSurface;
              if (cell.marked) bgColor = colors.accentPrimaryGlow;
              if (isWin) bgColor = colors.accentPrimary;

              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => onCellClick(r, c)}
                  disabled={disabled}
                  activeOpacity={0.6}
                  style={[
                    styles.cell,
                    {
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: bgColor,
                      borderColor: cell.marked ? colors.accentPrimary : colors.glassBorder,
                      borderWidth: isHighlighted ? 2 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      {
                        color: isWin
                          ? 'white'
                          : cell.marked
                            ? colors.textPrimary
                            : isHighlighted
                              ? colors.accentPrimary
                              : colors.textMuted,
                      },
                    ]}
                  >
                    {cell.number !== null ? cell.number : ''}
                  </Text>
                  {cell.marked && !isWin && (
                    <View style={[styles.markDot, { backgroundColor: colors.accentPrimary }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardWrap: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    width: BOARD_SIZE,
    paddingTop: spacing.sm,
  },
  grid: {
    padding: spacing.sm,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  cell: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellText: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bodySemiBold,
  },
  markDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

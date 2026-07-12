import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { gameColors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { fontSize, fonts } from '../../theme/typography';
import { PLAYER_1 } from './logic';

interface BoardProps {
  board: (number | null)[];
  onCellClick: (index: number) => void;
  winningCells: number[] | null;
  disabled: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH * 0.85, 340);
const CELL_SIZE = (BOARD_SIZE - spacing.sm * 2 - spacing.sm * 2) / 3;

export default function Board({ board, onCellClick, winningCells, disabled }: BoardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.board, { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder }, shadows.md]}>
      {board.map((cell, index) => {
        const isWinningCell = winningCells?.includes(index);
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.cell,
              { backgroundColor: colors.bgCard, borderColor: colors.glassBorder },
              isWinningCell && { backgroundColor: 'rgba(255,255,255,0.1)' }
            ]}
            onPress={() => onCellClick(index)}
            disabled={disabled || cell !== null}
            activeOpacity={0.7}
          >
            {cell !== null && (
              <Text style={[styles.cellText, { color: cell === PLAYER_1 ? gameColors.discRed : gameColors.discYellow }]}>
                {cell === PLAYER_1 ? 'X' : 'O'}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    alignContent: 'center',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 48,
    fontFamily: fonts.display,
  },
});

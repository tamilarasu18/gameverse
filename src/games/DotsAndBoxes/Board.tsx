import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { GameState, DOTS_ROWS, DOTS_COLS, BOX_ROWS, BOX_COLS, PLAYER_1 } from './logic';
import { useTheme } from '../../context/ThemeContext';
import { gameColors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 400);
const DOT_SIZE = 12;
const SPACING = (BOARD_SIZE - (DOTS_COLS * DOT_SIZE)) / BOX_COLS;

interface BoardProps {
  state: GameState;
  onLineClick: (type: 'h' | 'v', r: number, c: number) => void;
  disabled: boolean;
}

export default function Board({ state, onLineClick, disabled }: BoardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
      {/* Render Boxes */}
      {state.boxes.map((row, br) =>
        row.map((boxOwner, bc) => {
          if (boxOwner === null) return null;
          return (
            <View
              key={`box-${br}-${bc}`}
              style={[
                styles.box,
                {
                  left: bc * (DOT_SIZE + SPACING) + DOT_SIZE,
                  top: br * (DOT_SIZE + SPACING) + DOT_SIZE,
                  width: SPACING,
                  height: SPACING,
                  backgroundColor: boxOwner === PLAYER_1 ? gameColors.discRedGlow : gameColors.discYellowGlow,
                },
              ]}
            />
          );
        })
      )}

      {/* Render Horizontal Lines */}
      {state.horizontalLines.map((row, r) =>
        row.map((isDrawn, c) => (
          <TouchableOpacity
            key={`h-${r}-${c}`}
            disabled={disabled || isDrawn}
            onPress={() => onLineClick('h', r, c)}
            activeOpacity={0.7}
            style={[
              styles.hLine,
              {
                left: c * (DOT_SIZE + SPACING) + DOT_SIZE,
                top: r * (DOT_SIZE + SPACING) - DOT_SIZE / 2,
                width: SPACING,
                height: DOT_SIZE * 2, // touch area
              }
            ]}
          >
            <View style={[
              styles.hLineVisible,
              isDrawn && { backgroundColor: colors.accentPrimary },
              !isDrawn && { backgroundColor: colors.glassBorder }
            ]} />
          </TouchableOpacity>
        ))
      )}

      {/* Render Vertical Lines */}
      {state.verticalLines.map((row, r) =>
        row.map((isDrawn, c) => (
          <TouchableOpacity
            key={`v-${r}-${c}`}
            disabled={disabled || isDrawn}
            onPress={() => onLineClick('v', r, c)}
            activeOpacity={0.7}
            style={[
              styles.vLine,
              {
                left: c * (DOT_SIZE + SPACING) - DOT_SIZE / 2,
                top: r * (DOT_SIZE + SPACING) + DOT_SIZE,
                width: DOT_SIZE * 2, // touch area
                height: SPACING,
              }
            ]}
          >
            <View style={[
              styles.vLineVisible,
              isDrawn && { backgroundColor: colors.accentPrimary },
              !isDrawn && { backgroundColor: colors.glassBorder }
            ]} />
          </TouchableOpacity>
        ))
      )}

      {/* Render Dots */}
      {Array(DOTS_ROWS).fill(null).map((_, r) =>
        Array(DOTS_COLS).fill(null).map((_, c) => (
          <View
            key={`dot-${r}-${c}`}
            style={[
              styles.dot,
              { backgroundColor: colors.textPrimary },
              {
                left: c * (DOT_SIZE + SPACING),
                top: r * (DOT_SIZE + SPACING),
              }
            ]}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    zIndex: 10,
  },
  hLine: {
    position: 'absolute',
    justifyContent: 'center',
    zIndex: 5,
  },
  hLineVisible: {
    height: 4,
    width: '100%',
    borderRadius: 2,
  },
  vLine: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  vLineVisible: {
    width: 4,
    height: '100%',
    borderRadius: 2,
  },
  box: {
    position: 'absolute',
    zIndex: 1,
  },
});

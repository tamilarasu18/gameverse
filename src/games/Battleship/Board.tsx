import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BOARD_SIZE, ShipPlacement, Shot } from './logic';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const BOARD_DIMENSION = Math.min(width - 32, 350);
const CELL_SIZE = BOARD_DIMENSION / BOARD_SIZE;

interface BoardProps {
  ships: ShipPlacement[];
  shots: Shot[];
  onCellClick?: (r: number, c: number) => void;
  disabled?: boolean;
  hideShips?: boolean;
}

export default function Board({ ships, shots, onCellClick, disabled, hideShips }: BoardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { width: BOARD_DIMENSION, height: BOARD_DIMENSION, backgroundColor: colors.boardBgDark }]}>
      {/* Grid */}
      {Array(BOARD_SIZE).fill(null).map((_, r) =>
        Array(BOARD_SIZE).fill(null).map((_, c) => {
          return (
            <TouchableOpacity
              key={`cell-${r}-${c}`}
              activeOpacity={onCellClick && !disabled ? 0.7 : 1}
              onPress={() => {
                if (onCellClick && !disabled) onCellClick(r, c);
              }}
              style={[
                styles.cell,
                {
                  left: c * CELL_SIZE,
                  top: r * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderColor: colors.boardBg,
                }
              ]}
            />
          );
        })
      )}

      {/* Ships */}
      {!hideShips && ships.map((ship) => (
        <View
          key={`ship-${ship.id}`}
          style={[
            styles.ship,
            { backgroundColor: colors.accentSecondary },
            {
              left: ship.c * CELL_SIZE + 2,
              top: ship.r * CELL_SIZE + 2,
              width: ship.isVertical ? CELL_SIZE - 4 : ship.length * CELL_SIZE - 4,
              height: ship.isVertical ? ship.length * CELL_SIZE - 4 : CELL_SIZE - 4,
            }
          ]}
        />
      ))}

      {/* Shots */}
      {shots.map((shot, idx) => (
        <View
          key={`shot-${idx}`}
          style={[
            styles.shot,
            {
              left: shot.c * CELL_SIZE,
              top: shot.r * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }
          ]}
        >
          <View
            style={[
              styles.shotMarker,
              shot.result === 'miss' && { backgroundColor: 'white', opacity: 0.5 },
              (shot.result === 'hit' || shot.result === 'sunk') && { backgroundColor: colors.accentDanger },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderWidth: 2,
    borderColor: '#1E40AF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
    borderWidth: 0.5,
  },
  ship: {
    position: 'absolute',
    borderRadius: 16,
    opacity: 0.8,
  },
  shot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none', // Allow clicking through shots if needed
  },
  shotMarker: {
    width: '40%',
    height: '40%',
    borderRadius: 99,
  },
});

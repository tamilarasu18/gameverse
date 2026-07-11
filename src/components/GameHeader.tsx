import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import PlayerBadge from './PlayerBadge';
import ThemeToggle from './ThemeToggle';
import { spacing, radius, TOUCH_MIN } from '../theme/spacing';
import { fontSize, fonts } from '../theme/typography';
import type { RootStackParamList } from '../navigation/AppNavigator';

interface GameHeaderProps {
  gameName: string;
  player1: { id: string | number; name: string; avatar: string } | null;
  player2: { id: string | number; name: string; avatar: string } | null;
  currentTurn: string | number;
  roomCode?: string | null;
  onLeave?: () => void;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function GameHeader({ gameName, player1, player2, currentTurn, onLeave, navigation }: GameHeaderProps) {
  const { colors } = useTheme();

  const handleLeave = () => {
    if (onLeave) onLeave();
    navigation.navigate('Lobby');
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.bgSecondary, borderBottomColor: colors.glassBorder }]}>
      <View style={styles.left}>
        <TouchableOpacity
          onPress={handleLeave}
          style={[styles.backBtn, { backgroundColor: colors.bgSurface }]}
          accessibilityLabel="Back to lobby"
        >
          <Feather name="arrow-left" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.accentPrimary }]} numberOfLines={1}>{gameName}</Text>
      </View>

      <View style={styles.players}>
        <PlayerBadge player={player1} isActive={currentTurn === player1?.id || currentTurn === 1} showStatus />
        <Text style={[styles.vs, { color: colors.textMuted }]}>VS</Text>
        <PlayerBadge player={player2} isActive={currentTurn === player2?.id || currentTurn === 2} showStatus />
      </View>

      <ThemeToggle />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1, marginRight: spacing.sm },
  backBtn: { width: TOUCH_MIN, height: TOUCH_MIN, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: fontSize.base, flexShrink: 1 },
  players: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  vs: { fontFamily: fonts.display, fontSize: fontSize.xs },
});

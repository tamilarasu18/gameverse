import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import { fontSize, fonts } from '../theme/typography';

interface PlayerBadgeProps {
  player: { id: string | number; name: string; avatar: string } | null;
  isActive?: boolean;
  showStatus?: boolean;
}

export default function PlayerBadge({ player, isActive = false, showStatus = false }: PlayerBadgeProps) {
  const { colors } = useTheme();
  if (!player) return null;

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: isActive ? colors.accentPrimaryGlow : colors.bgSurface,
        borderColor: isActive ? colors.accentPrimary : 'transparent',
      },
    ]}>
      <Text style={styles.avatar}>{player.avatar}</Text>
      <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
        {player.name}
      </Text>
      {showStatus && isActive && (
        <View style={[styles.indicator, { backgroundColor: colors.accentSuccess }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  avatar: { fontSize: fontSize.base },
  name: { fontSize: fontSize.sm, fontFamily: fonts.bodySemiBold, maxWidth: 80 },
  indicator: { width: 6, height: 6, borderRadius: 3 },
});

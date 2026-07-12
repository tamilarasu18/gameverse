import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, ImageSourcePropType } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, radius, shadows, TOUCH_MIN } from '../theme/spacing';
import { fontSize, fonts } from '../theme/typography';

interface GameInfo {
  id: string;
  name: string;
  description: string;
  players: string;
  tags: string[];
  image?: ImageSourcePropType;
  disabled?: boolean;
}

interface GameCardProps {
  game: GameInfo;
  onPlay: () => void;
}

const GAME_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  'connect-four': 'target',
  'bingo': 'grid',
  'tic-tac-toe': 'hash',
};

const GAME_COLORS: Record<string, { bg: string; accent: string }> = {
  'connect-four': { bg: 'rgba(200, 90, 90, 0.1)', accent: '#C85A5A' },
  'bingo': { bg: 'rgba(212, 160, 78, 0.1)', accent: '#D4A04E' },
  'tic-tac-toe': { bg: 'rgba(90, 200, 200, 0.1)', accent: '#5AC8C8' },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 360);

export default function GameCard({ game, onPlay }: GameCardProps) {
  const { colors } = useTheme();
  const icon = GAME_ICONS[game.id] || 'lock';
  const gameColor = GAME_COLORS[game.id] || { bg: colors.bgSurface, accent: colors.textMuted };

  return (
    <TouchableOpacity
      onPress={onPlay}
      disabled={game.disabled}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.glassBorder,
          opacity: game.disabled ? 0.5 : 1,
          width: CARD_WIDTH,
        },
        shadows.md,
      ]}
      accessibilityLabel={`Play ${game.name}`}
      accessibilityRole="button"
    >
      {/* Icon area */}
      <View style={[styles.iconArea, { backgroundColor: gameColor.bg }]}>
        {game.image ? (
          <Image source={game.image} style={styles.gameImage} resizeMode="cover" />
        ) : (
          <Feather name={icon} size={36} color={gameColor.accent} />
        )}
        {/* Player badge */}
        <View style={[styles.playerBadge, { backgroundColor: colors.accentPrimary }]}>
          <Feather name="users" size={10} color="white" />
          <Text style={styles.playerBadgeText}>{game.players}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{game.name}</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
          {game.description}
        </Text>

        {/* Tags */}
        <View style={styles.tags}>
          {game.tags.map(tag => (
            <View key={tag} style={[styles.tag, { borderColor: colors.glassBorder }]}>
              <Text style={[styles.tagText, { color: colors.textMuted }]}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={[styles.cta, { borderTopColor: colors.glassBorder }]}>
          <Text style={[styles.ctaText, { color: colors.accentPrimary }]}>
            {game.disabled ? 'Coming Soon' : 'Play Now'}
          </Text>
          {!game.disabled && <Feather name="chevron-right" size={16} color={colors.accentPrimary} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  iconArea: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gameImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  playerBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  playerBadgeText: {
    color: 'white',
    fontSize: fontSize.xs,
    fontFamily: fonts.bodySemiBold,
  },
  info: {
    padding: spacing.lg,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  desc: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bodyMedium,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    minHeight: TOUCH_MIN,
  },
  ctaText: {
    fontSize: fontSize.base,
    fontFamily: fonts.bodySemiBold,
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { usePlayer, AVATARS } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { spacing, radius, shadows, TOUCH_MIN } from '../theme/spacing';
import { fontSize, fonts } from '../theme/typography';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  const { player, createProfile } = usePlayer();
  const { colors } = useTheme();
  const [showSetup, setShowSetup] = useState(false);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleEnter = () => {
    if (player) {
      navigation.navigate('Lobby');
    } else {
      setShowSetup(true);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createProfile(name, selectedAvatar);
    navigation.navigate('Lobby');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Theme toggle */}
        <View style={styles.themeToggleWrap}>
          <ThemeToggle />
        </View>

        {/* Logo */}
        <View style={styles.logo}>
          <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
          <Text style={[styles.logoText, { color: colors.textPrimary }]}>
            Game<Text style={{ color: colors.accentPrimary }}>Verse</Text>
          </Text>
        </View>

        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Play classic games with friends — anywhere in the world
        </Text>

        {/* Game chips */}
        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
            <View style={[styles.chipDot, { backgroundColor: '#C85A5A' }]} />
            <Text style={[styles.chipText, { color: colors.textPrimary }]}>Connect Four</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
            <View style={[styles.chipDot, { backgroundColor: '#D4A04E' }]} />
            <Text style={[styles.chipText, { color: colors.textPrimary }]}>Pattern Bingo</Text>
          </View>
        </View>

        {!showSetup && (
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: colors.accentPrimary }, shadows.md]}
            onPress={handleEnter}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>
              {player ? `Continue as ${player.name}` : 'Enter GameVerse'}
            </Text>
            <Feather name="chevron-right" size={20} color="white" />
          </TouchableOpacity>
        )}

        {/* Setup form */}
        {showSetup && (
          <View style={[styles.setupCard, { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder }, shadows.lg]}>
            <Text style={[styles.setupTitle, { color: colors.textPrimary }]}>Create Your Profile</Text>
            <Text style={[styles.setupHint, { color: colors.textSecondary }]}>Choose a name and avatar</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Your Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bgInput, borderColor: colors.glassBorder, color: colors.textPrimary }]}
              placeholder="Enter your name..."
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={20}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Choose Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map(avatar => (
                <TouchableOpacity
                  key={avatar}
                  style={[
                    styles.avatarBtn,
                    { backgroundColor: colors.bgTertiary, borderColor: selectedAvatar === avatar ? colors.accentPrimary : 'transparent' },
                    selectedAvatar === avatar && { backgroundColor: colors.accentPrimaryGlow },
                  ]}
                  onPress={() => setSelectedAvatar(avatar)}
                >
                  <Text style={styles.avatarEmoji}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.accentPrimary, opacity: name.trim() ? 1 : 0.5 }]}
              onPress={handleCreate}
              disabled={!name.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>🚀 Start Playing</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: 'globe' as const, label: 'Online Multiplayer' },
            { icon: 'zap' as const, label: 'Real-time Sync' },
            { icon: 'heart' as const, label: 'Beautiful UI' },
          ].map(f => (
            <View key={f.label} style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
                <Feather name={f.icon} size={18} color={colors.accentPrimary} />
              </View>
              <Text style={[styles.featureText, { color: colors.textMuted }]}>{f.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  themeToggleWrap: { position: 'absolute', top: spacing.lg, right: spacing.lg, zIndex: 10 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: radius.xl,
  },
  logoText: { fontFamily: fonts.display, fontSize: fontSize.hero, letterSpacing: -1 },
  tagline: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 26,
    marginBottom: spacing['3xl'],
  },
  chips: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing['3xl'] },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: fontSize.sm, fontFamily: fonts.bodyMedium },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['4xl'],
    paddingVertical: spacing.lg,
    borderRadius: radius['2xl'],
    minHeight: 52,
    marginBottom: spacing['3xl'],
  },
  ctaText: { color: 'white', fontSize: fontSize.lg, fontFamily: fonts.bodySemiBold },
  setupCard: {
    width: Math.min(width - 48, 400),
    borderRadius: radius['2xl'],
    borderWidth: 1,
    padding: spacing['2xl'],
    marginBottom: spacing['3xl'],
  },
  setupTitle: { fontFamily: fonts.display, fontSize: fontSize['2xl'], textAlign: 'center', marginBottom: spacing.xs },
  setupHint: { fontSize: fontSize.sm, textAlign: 'center', marginBottom: spacing['2xl'] },
  label: { fontSize: fontSize.sm, fontFamily: fonts.bodySemiBold, marginBottom: spacing.sm },
  input: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    fontSize: fontSize.base,
    minHeight: TOUCH_MIN,
    marginBottom: spacing.xl,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  avatarBtn: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarEmoji: { fontSize: fontSize.xl },
  createBtn: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    minHeight: 52,
  },
  createBtnText: { color: 'white', fontSize: fontSize.lg, fontFamily: fonts.bodySemiBold },
  features: { flexDirection: 'row', gap: spacing['2xl'] },
  feature: { alignItems: 'center', gap: spacing.sm },
  featureIcon: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { fontSize: fontSize.sm, fontFamily: fonts.bodyMedium },
});

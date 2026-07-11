import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import ThemeToggle from '../components/ThemeToggle';
import GameCard from '../components/GameCard';
import RoomManager from '../components/RoomManager';
import { spacing, radius, TOUCH_MIN } from '../theme/spacing';
import { fontSize, fonts } from '../theme/typography';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Lobby'>;

interface GameInfo {
  id: string;
  name: string;
  description: string;
  players: string;
  tags: string[];
  route: keyof RootStackParamList;
  disabled?: boolean;
}

const GAMES: GameInfo[] = [
  {
    id: 'connect-four',
    name: 'Connect Four',
    description: 'Drop discs and connect four in a row to win! Classic strategy game for two players.',
    players: '2 Players',
    tags: ['Strategy', 'Classic', 'Turn-based'],
    route: 'ConnectFour',
  },
  {
    id: 'bingo',
    name: 'Pattern Bingo',
    description: 'Complete the target pattern on your bingo card before your opponent!',
    players: '2 Players',
    tags: ['Luck', 'Pattern', 'Exciting'],
    route: 'Bingo',
  },
  {
    id: 'quoridor',
    name: 'Quoridor',
    description: 'Navigate your pawn to the opposite side while placing walls to block your opponent!',
    players: '2 Players',
    tags: ['Strategy', 'Maze', 'Tactics'],
    route: 'Quoridor',
  },
  {
    id: 'dots-and-boxes',
    name: 'Dots and Boxes',
    description: 'Connect the dots to form boxes. Capture the most boxes to win!',
    players: '2 Players',
    tags: ['Logic', 'Classic', 'Casual'],
    route: 'DotsAndBoxes',
  },
  {
    id: 'battleship',
    name: 'Battleship',
    description: 'Deploy your fleet and destroy enemy ships before they sink yours!',
    players: '2 Players',
    tags: ['Strategy', 'Hidden-state', 'Combat'],
    route: 'Battleship',
  },
  {
    id: 'coming-soon',
    name: 'More Games',
    description: 'New games are being added regularly. Stay tuned!',
    players: '',
    tags: [],
    route: 'Lobby',
    disabled: true,
  },
];

export default function LobbyScreen({ navigation }: Props) {
  const { player, clearProfile } = usePlayer();
  const { colors } = useTheme();
  const multiplayer = useMultiplayer();
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);

  const handlePlay = (game: GameInfo) => {
    if (game.disabled) return;
    setSelectedGame(game);
  };

  const handleRoomReady = (roomCode: string, isLocal: boolean) => {
    if (!selectedGame) return;
    setSelectedGame(null);
    navigation.navigate(selectedGame.route as any, { roomId: isLocal ? 'local' : roomCode, isLocal });
  };

  const handleSignOut = () => {
    clearProfile();
    navigation.navigate('Landing');
  };

  if (!player) {
    navigation.navigate('Landing');
    return null;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: colors.bgSecondary, borderBottomColor: colors.glassBorder }]}>
        <View style={styles.brand}>
          <Image source={require('../../assets/icon.png')} style={styles.brandLogo} />
          <Text style={[styles.brandText, { color: colors.textPrimary }]}>
            Game<Text style={{ color: colors.accentPrimary }}>Verse</Text>
          </Text>
        </View>

        <View style={styles.topActions}>
          <ThemeToggle />
          <View style={[styles.profilePill, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
            <Text style={styles.profileAvatar}>{player.avatar}</Text>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{player.name}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} accessibilityLabel="Sign out">
            <Feather name="log-out" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Games */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.textPrimary }]}>Choose a Game</Text>
        <Text style={[styles.subheading, { color: colors.textSecondary }]}>
          Select a game and play with friends online or locally
        </Text>

        <View style={styles.cards}>
          {GAMES.map(game => (
            <GameCard key={game.id} game={game} onPlay={() => handlePlay(game)} />
          ))}
        </View>
      </ScrollView>

      {/* Room Manager Modal */}
      {selectedGame && (
        <RoomManager
          gameType={selectedGame.id}
          gameName={selectedGame.name}
          onRoomReady={handleRoomReady}
          onCancel={() => setSelectedGame(null)}
          multiplayer={multiplayer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandLogo: { width: 24, height: 24, borderRadius: 6 },
  brandText: { fontFamily: fonts.display, fontSize: fontSize.base },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  profileAvatar: { fontSize: fontSize.base },
  profileName: { fontSize: fontSize.sm, fontFamily: fonts.bodySemiBold },
  signOutBtn: { width: TOUCH_MIN, height: TOUCH_MIN, alignItems: 'center', justifyContent: 'center' },
  content: {
    padding: spacing['2xl'],
    alignItems: 'center',
    paddingBottom: spacing['5xl'],
  },
  heading: { fontFamily: fonts.display, fontSize: fontSize['2xl'], marginBottom: spacing.xs },
  subheading: { fontSize: fontSize.sm, marginBottom: spacing['3xl'], textAlign: 'center' },
  cards: { 
    width: '100%', 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: spacing.lg 
  },
});

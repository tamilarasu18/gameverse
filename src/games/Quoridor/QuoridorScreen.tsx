import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../../context/ThemeContext';
import { useMultiplayer } from '../../context/MultiplayerContext';
import GameHeader from '../../components/GameHeader';
import Board from './Board';
import { createInitialState, movePawn, placeWall, PLAYER_1, PLAYER_2 } from './logic';
import { gameColors } from '../../theme/colors';
import { spacing, radius, shadows, TOUCH_MIN } from '../../theme/spacing';
import { fontSize, fonts } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Quoridor'>;

export default function QuoridorScreen({ route, navigation }: Props) {
  const { roomId, isLocal } = route.params;
  const { player } = usePlayer();
  const { colors } = useTheme();
  const multiplayer = useMultiplayer();

  const [gameState, setGameState] = useState(createInitialState());

  const currentState = (!isLocal && multiplayer.gameState) ? multiplayer.gameState : gameState;

  const myInfo = { id: player?.id || '', name: player?.name || '', avatar: player?.avatar || '' };
  const opponentInfo = multiplayer.opponent
    ? { id: multiplayer.opponent.id, name: multiplayer.opponent.name, avatar: multiplayer.opponent.avatar }
    : { id: 'waiting', name: 'Waiting...', avatar: '⏳' };

  const player1 = isLocal
    ? { id: 1, name: 'Player 1', avatar: '🔴' }
    : multiplayer.isHost ? myInfo : opponentInfo;

  const player2 = isLocal
    ? { id: 2, name: 'Player 2', avatar: '🟡' }
    : multiplayer.isHost ? opponentInfo : myInfo;

  const myPlayer = isLocal 
    ? currentState.currentPlayer 
    : multiplayer.isHost ? PLAYER_1 : PLAYER_2;

  const isMyTurn = useCallback(() => {
    if (isLocal) return true;
    if (!multiplayer.opponent) return false;
    return currentState.currentPlayer === myPlayer;
  }, [isLocal, multiplayer.opponent, currentState.currentPlayer, myPlayer]);

  const handleMoveClick = useCallback((r: number, c: number) => {
    if (!isMyTurn() || currentState.winner) return;

    const newState = movePawn(currentState, currentState.currentPlayer, r, c);
    if (!newState) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isLocal) setGameState(newState);
    else multiplayer.updateGameState(newState);

    if (newState.winner) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [currentState, isLocal, isMyTurn, multiplayer]);

  const handleWallClick = useCallback((type: 'h' | 'v', r: number, c: number) => {
    if (!isMyTurn() || currentState.winner) return;

    const newState = placeWall(currentState, currentState.currentPlayer, type, r, c);
    if (!newState) {
      // Invalid wall placement (blocked path or overlapping)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isLocal) setGameState(newState);
    else multiplayer.updateGameState(newState);
  }, [currentState, isLocal, isMyTurn, multiplayer]);

  const handleRematch = () => {
    const freshState = createInitialState();
    if (isLocal) setGameState(freshState);
    else multiplayer.updateGameState(freshState);
  };

  const handleLeave = () => {
    if (!isLocal) multiplayer.leaveRoom();
  };

  const getStatusText = () => {
    if (currentState.winner) {
      const w = currentState.winner === PLAYER_1 ? player1 : player2;
      return `${w.avatar} ${w.name} wins!`;
    }
    if (!isLocal && !isMyTurn()) return "Opponent's turn...";
    const t = currentState.currentPlayer === PLAYER_1 ? player1 : player2;
    return `${t.avatar} ${t.name}'s turn`;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]} edges={['top', 'bottom', 'left', 'right']}>
      <GameHeader
        gameName="Quoridor"
        player1={player1}
        player2={player2}
        currentTurn={currentState.currentPlayer}
        roomCode={isLocal ? null : roomId}
        onLeave={handleLeave}
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Turn & Walls Board */}
        <View style={[styles.infoBoard, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
          <Text style={[styles.turnText, { color: colors.textPrimary }]}>{getStatusText()}</Text>
          <View style={styles.wallsContainer}>
            <View style={styles.wallCount}>
              <View style={[styles.wallDot, { backgroundColor: gameColors.discRed }]} />
              <Text style={[styles.wallText, { color: colors.textSecondary }]}>{currentState.p1Walls} walls</Text>
            </View>
            <View style={styles.wallCount}>
              <View style={[styles.wallDot, { backgroundColor: gameColors.discYellow }]} />
              <Text style={[styles.wallText, { color: colors.textSecondary }]}>{currentState.p2Walls} walls</Text>
            </View>
          </View>
        </View>

        {/* Board */}
        <Board
          state={currentState}
          onMoveClick={handleMoveClick}
          onWallClick={handleWallClick}
          disabled={!!currentState.winner || (!isLocal && !isMyTurn())}
          myPlayer={myPlayer}
        />

        {/* Result */}
        {currentState.winner && (
          <View style={[styles.result, { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder }, shadows.lg]}>
            <Text style={[styles.resultTitle, { color: colors.accentPrimary }]}>
              {currentState.winner === PLAYER_1 ? player1.name : player2.name} Wins! 🎉
            </Text>
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accentPrimary }]} onPress={handleRematch}>
                <Text style={styles.actionBtnText}>Rematch 🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder, borderWidth: 1 }]}
                onPress={() => { handleLeave(); navigation.navigate('Lobby'); }}
              >
                <Text style={[styles.actionBtnTextSec, { color: colors.textPrimary }]}>Back to Lobby</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { alignItems: 'center', padding: spacing.lg, paddingBottom: spacing['5xl'] },
  infoBoard: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing['2xl'],
    width: '100%',
    maxWidth: 360,
  },
  turnText: { fontSize: fontSize.base, fontFamily: fonts.bodySemiBold, marginBottom: spacing.sm },
  wallsContainer: { flexDirection: 'row', gap: spacing['2xl'] },
  wallCount: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  wallDot: { width: 8, height: 8, borderRadius: 4 },
  wallText: { fontSize: fontSize.sm, fontFamily: fonts.bodyMedium },
  result: {
    marginTop: spacing['2xl'],
    padding: spacing['2xl'],
    borderRadius: radius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  resultTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, marginBottom: spacing.lg },
  resultActions: { flexDirection: 'row', gap: spacing.md },
  actionBtn: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    minHeight: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: { color: 'white', fontSize: fontSize.base, fontFamily: fonts.bodySemiBold },
  actionBtnTextSec: { fontSize: fontSize.base, fontFamily: fonts.bodySemiBold },
});

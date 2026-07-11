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
import { createInitialState, drawLine, PLAYER_1, PLAYER_2 } from './logic';
import { gameColors } from '../../theme/colors';
import { spacing, radius, shadows, TOUCH_MIN } from '../../theme/spacing';
import { fontSize, fonts } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'DotsAndBoxes'>;

export default function DotsAndBoxesScreen({ route, navigation }: Props) {
  const { roomId, isLocal } = route.params;
  const { player } = usePlayer();
  const { colors } = useTheme();
  const multiplayer = useMultiplayer();

  const [gameState, setGameState] = useState(createInitialState());

  // In online mode, we sync state via Firebase
  const currentState = (!isLocal && multiplayer.gameState) ? multiplayer.gameState : gameState;

  const myInfo = { id: player?.id || '', name: player?.name || '', avatar: player?.avatar || '' };
  const opponentInfo = multiplayer.opponent
    ? { id: multiplayer.opponent.id, name: multiplayer.opponent.name, avatar: multiplayer.opponent.avatar }
    : { id: 'waiting', name: 'Waiting...', avatar: '⏳' };

  const player1 = isLocal
    ? { id: 1, name: 'Player 1', avatar: '🔴' }
    : multiplayer.isHost ? myInfo : opponentInfo;

  const player2 = isLocal
    ? { id: 2, name: 'Player 2', avatar: '🔵' }
    : multiplayer.isHost ? opponentInfo : myInfo;

  const isMyTurn = useCallback(() => {
    if (isLocal) return true;
    if (!multiplayer.opponent) return false;
    return multiplayer.isHost ? currentState.currentPlayer === PLAYER_1 : currentState.currentPlayer === PLAYER_2;
  }, [isLocal, multiplayer.isHost, multiplayer.opponent, currentState.currentPlayer]);

  const handleLineClick = useCallback((type: 'h' | 'v', r: number, c: number) => {
    if (!isMyTurn() || currentState.winner || currentState.isDraw) return;

    const newState = drawLine(currentState, type, r, c, currentState.currentPlayer);
    if (!newState) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isLocal) {
      setGameState(newState);
    } else {
      multiplayer.updateGameState(newState);
    }

    if (newState.winner || newState.isDraw) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [currentState, isLocal, isMyTurn, multiplayer]);

  const handleRematch = () => {
    const freshState = createInitialState();
    if (isLocal) {
      setGameState(freshState);
    } else {
      multiplayer.updateGameState(freshState);
    }
  };

  const handleLeave = () => {
    if (!isLocal) multiplayer.leaveRoom();
  };

  const getStatusText = () => {
    if (currentState.winner) {
      const w = currentState.winner === PLAYER_1 ? player1 : player2;
      return `${w.avatar} ${w.name} wins!`;
    }
    if (currentState.isDraw) return "It's a draw!";
    if (!isLocal && !isMyTurn()) return "Opponent's turn...";
    const t = currentState.currentPlayer === PLAYER_1 ? player1 : player2;
    return `${t.avatar} ${t.name}'s turn`;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]} edges={['top', 'bottom', 'left', 'right']}>
      <GameHeader
        gameName="Dots & Boxes"
        player1={player1}
        player2={player2}
        currentTurn={currentState.currentPlayer}
        roomCode={isLocal ? null : roomId}
        onLeave={handleLeave}
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Score Board */}
        <View style={styles.scoreBoard}>
          <View style={[styles.scorePill, { backgroundColor: gameColors.discRedGlow, borderColor: gameColors.discRed }]}>
            <Text style={styles.scoreText}>{player1.name}: {currentState.scores[PLAYER_1]}</Text>
          </View>
          <View style={[styles.scorePill, { backgroundColor: gameColors.discYellowGlow, borderColor: gameColors.discYellow }]}>
            <Text style={styles.scoreText}>{player2.name}: {currentState.scores[PLAYER_2]}</Text>
          </View>
        </View>

        {/* Turn indicator */}
        <View style={[styles.turnBar, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
          <Text style={[styles.turnText, { color: colors.textPrimary }]}>{getStatusText()}</Text>
        </View>

        {/* Board */}
        <Board
          state={currentState}
          onLineClick={handleLineClick}
          disabled={!!currentState.winner || currentState.isDraw || (!isLocal && !isMyTurn())}
        />

        {/* Result */}
        {(currentState.winner || currentState.isDraw) && (
          <View style={[styles.result, { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder }, shadows.lg]}>
            <Text style={[styles.resultTitle, { color: colors.accentPrimary }]}>
              {currentState.winner ? `${currentState.winner === PLAYER_1 ? player1.name : player2.name} Wins! 🎉` : "It's a Draw! 🤝"}
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
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 360,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  scorePill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  scoreText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: 'white',
  },
  turnBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    marginBottom: spacing['2xl'],
    minWidth: 200,
  },
  turnText: { fontSize: fontSize.base, fontFamily: fonts.bodySemiBold },
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

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
import { createBoard, dropPiece, checkWinner, isBoardFull, PLAYER_1, PLAYER_2 } from './logic';
import { gameColors } from '../../theme/colors';
import { spacing, radius, shadows, TOUCH_MIN } from '../../theme/spacing';
import { fontSize, fonts } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ConnectFour'>;

export default function ConnectFourScreen({ route, navigation }: Props) {
  const { roomId, isLocal } = route.params;
  const { player } = usePlayer();
  const { colors } = useTheme();
  const multiplayer = useMultiplayer();

  const [gameState, setGameState] = useState({
    board: createBoard(),
    currentPlayer: PLAYER_1,
    winner: null as number | null,
    winningCells: null as number[][] | null,
    isDraw: false,
    moveCount: 0,
  });

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

  const isMyTurn = useCallback(() => {
    if (isLocal) return true;
    if (!multiplayer.opponent) return false;
    return multiplayer.isHost ? currentState.currentPlayer === PLAYER_1 : currentState.currentPlayer === PLAYER_2;
  }, [isLocal, multiplayer.isHost, multiplayer.opponent, currentState.currentPlayer]);

  const handleColumnClick = useCallback((col: number) => {
    if (currentState.winner || currentState.isDraw || !isMyTurn()) return;

    const newBoard = dropPiece(currentState.board, col, currentState.currentPlayer);
    if (!newBoard) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMoveCount = currentState.moveCount + 1;
    const result = checkWinner(newBoard);
    const draw = !result && isBoardFull(newBoard);
    const nextPlayer = currentState.currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;

    const newState = {
      board: newBoard,
      currentPlayer: result || draw ? currentState.currentPlayer : nextPlayer,
      moveCount: newMoveCount,
      winner: result ? result.winner : null,
      winningCells: result ? result.cells : null,
      isDraw: draw,
    };

    if (isLocal) {
      setGameState(newState);
    } else {
      multiplayer.updateGameState(newState);
    }

    if (result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [currentState, isLocal, isMyTurn, multiplayer]);

  const handleRematch = () => {
    const freshState = { 
      board: createBoard(), 
      currentPlayer: PLAYER_1, 
      moveCount: 0, 
      winner: null, 
      winningCells: null, 
      isDraw: false 
    };
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
        gameName="Connect Four"
        player1={player1}
        player2={player2}
        currentTurn={currentState.currentPlayer}
        roomCode={isLocal ? null : roomId}
        onLeave={handleLeave}
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Turn indicator */}
        <View style={[styles.turnBar, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
          <View style={[styles.turnDisc, { backgroundColor: currentState.currentPlayer === PLAYER_1 ? gameColors.discRed : gameColors.discYellow }]} />
          <Text style={[styles.turnText, { color: colors.textPrimary }]}>{getStatusText()}</Text>
        </View>

        {/* Board */}
        <Board
          board={currentState.board}
          onColumnClick={handleColumnClick}
          winningCells={currentState.winningCells}
          disabled={!!currentState.winner || currentState.isDraw || (!isLocal && !isMyTurn())}
        />

        {/* Result */}
        {(currentState.winner || currentState.isDraw) && (
          <View style={[styles.result, { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder }, shadows.lg]}>
            <Text style={[styles.resultTitle, { color: colors.accentPrimary }]}>
              {currentState.winner ? `${currentState.winner === PLAYER_1 ? player1.name : player2.name} Wins! 🎉` : "It's a Draw! 🤝"}
            </Text>
            <Text style={[styles.resultMoves, { color: colors.textSecondary }]}>{currentState.moveCount} moves played</Text>
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
  turnBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    marginBottom: spacing['2xl'],
  },
  turnDisc: { width: 20, height: 20, borderRadius: 10 },
  turnText: { fontSize: fontSize.sm, fontFamily: fonts.bodySemiBold },
  result: {
    marginTop: spacing['2xl'],
    padding: spacing['2xl'],
    borderRadius: radius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  resultTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, marginBottom: spacing.xs },
  resultMoves: { fontSize: fontSize.sm, marginBottom: spacing.lg },
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

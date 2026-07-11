import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../../context/ThemeContext';
import { useMultiplayer } from '../../context/MultiplayerContext';
import GameHeader from '../../components/GameHeader';
import BingoBoard from './Board';
import { generateEmptyBoard, placeNumber, markNumber, checkWinner, isBoardFull, BoardState } from './logic';
import { spacing, radius, shadows, TOUCH_MIN } from '../../theme/spacing';
import { fontSize, fonts } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Bingo'>;

export default function BingoScreen({ route, navigation }: Props) {
  const { roomId, isLocal } = route.params;
  const { player } = usePlayer();
  const { colors } = useTheme();
  const multiplayer = useMultiplayer();

  const [gameState, setGameState] = useState({
    gamePhase: 'setup' as 'setup' | 'playing' | 'ended',
    board1: generateEmptyBoard(),
    board2: generateEmptyBoard(),
    setupNum1: 1,
    setupNum2: 1,
    currentPlayer: 1,
    calledNumbers: [] as number[],
    winner: null as number | null,
    winningCells1: null as [number, number][] | null,
    winningCells2: null as [number, number][] | null,
    strikes1: 0,
    strikes2: 0,
  });

  const currentState = (!isLocal && multiplayer.gameState) ? multiplayer.gameState : gameState;

  const myInfo = { id: player?.id || '', name: player?.name || '', avatar: player?.avatar || '' };
  const opponentInfo = multiplayer.opponent
    ? { id: multiplayer.opponent.id, name: multiplayer.opponent.name, avatar: multiplayer.opponent.avatar }
    : { id: 'waiting', name: 'Waiting...', avatar: '⏳' };

  const player1 = isLocal
    ? { id: 1, name: 'Player 1', avatar: '🔵' }
    : multiplayer.isHost ? myInfo : opponentInfo;

  const player2 = isLocal
    ? { id: 2, name: 'Player 2', avatar: '🟠' }
    : multiplayer.isHost ? opponentInfo : myInfo;

  const showBoard1 = isLocal || multiplayer.isHost;
  const showBoard2 = isLocal || !multiplayer.isHost;

  const isMyTurn = useCallback((action: 'setup' | 'play', boardNum: number) => {
    if (isLocal) return true;
    const amHost = multiplayer.isHost;
    if (action === 'setup') return amHost ? boardNum === 1 : boardNum === 2;
    if (action === 'play') return amHost ? currentState.currentPlayer === 1 : currentState.currentPlayer === 2;
    return false;
  }, [isLocal, multiplayer.isHost, currentState.currentPlayer]);

  const handleCellClick = useCallback((boardNum: number, row: number, col: number) => {
    if (currentState.gamePhase === 'ended') return;

    if (currentState.gamePhase === 'setup') {
      if (!isMyTurn('setup', boardNum)) return;
      
      const currentBoard = boardNum === 1 ? currentState.board1 : currentState.board2;
      const currentSetupNum = boardNum === 1 ? currentState.setupNum1 : currentState.setupNum2;
      
      if (currentBoard[row][col].number !== null) return;
      if (currentSetupNum > 25) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const newBoard = placeNumber(currentBoard, row, col, currentSetupNum);
      const newSetupNum = currentSetupNum + 1;
      
      let nextPhase = currentState.gamePhase;
      if (boardNum === 1) {
        if (newSetupNum > 25 && currentState.setupNum2 > 25) nextPhase = 'playing';
      } else {
        if (newSetupNum > 25 && currentState.setupNum1 > 25) nextPhase = 'playing';
      }

      const newState = {
        ...currentState,
        board1: boardNum === 1 ? newBoard : currentState.board1,
        board2: boardNum === 2 ? newBoard : currentState.board2,
        setupNum1: boardNum === 1 ? newSetupNum : currentState.setupNum1,
        setupNum2: boardNum === 2 ? newSetupNum : currentState.setupNum2,
        gamePhase: nextPhase
      };

      if (isLocal) setGameState(newState);
      else multiplayer.updateGameState(newState);

    } else if (currentState.gamePhase === 'playing') {
      if (!isMyTurn('play', boardNum)) return;
      if (boardNum !== currentState.currentPlayer) return;

      const currentBoard = boardNum === 1 ? currentState.board1 : currentState.board2;
      const cell = currentBoard[row][col];
      
      if (!cell.number || cell.marked) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const numToCall = cell.number;
      const newCalledNumbers = [...currentState.calledNumbers, numToCall];

      const newBoard1 = markNumber(currentState.board1, numToCall);
      const newBoard2 = markNumber(currentState.board2, numToCall);
      
      const check1 = checkWinner(newBoard1);
      const check2 = checkWinner(newBoard2);

      let newWinner = null;
      let nextPhase = 'playing';
      if (check1.isWinner || check2.isWinner) {
        if (check1.isWinner) newWinner = 1;
        if (check2.isWinner) newWinner = 2; // if both, 2 takes precedence here (rare edge case on same number call)
        nextPhase = 'ended';
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const newState = {
        ...currentState,
        board1: newBoard1,
        board2: newBoard2,
        calledNumbers: newCalledNumbers,
        strikes1: check1.strikes,
        strikes2: check2.strikes,
        winningCells1: check1.isWinner ? check1.winningCells : null,
        winningCells2: check2.isWinner ? check2.winningCells : null,
        winner: newWinner,
        gamePhase: nextPhase,
        currentPlayer: currentState.currentPlayer === 1 ? 2 : 1
      };

      if (isLocal) setGameState(newState);
      else multiplayer.updateGameState(newState);
    }
  }, [currentState, isLocal, isMyTurn, multiplayer]);

  const handleRematch = () => {
    const freshState = {
      gamePhase: 'setup' as const,
      board1: generateEmptyBoard(),
      board2: generateEmptyBoard(),
      setupNum1: 1,
      setupNum2: 1,
      currentPlayer: 1,
      calledNumbers: [],
      winner: null,
      winningCells1: null,
      winningCells2: null,
      strikes1: 0,
      strikes2: 0,
    };
    if (isLocal) setGameState(freshState);
    else multiplayer.updateGameState(freshState);
  };

  const handleLeave = () => {
    if (!isLocal) multiplayer.leaveRoom();
  };

  const renderBingoWord = (strikes: number) => {
    const word = ['B', 'I', 'N', 'G', 'O'];
    return (
      <View style={styles.bingoWord}>
        {word.map((letter, i) => (
          <Text key={i} style={[
            styles.bingoLetter,
            { color: i < strikes ? colors.accentPrimary : colors.textMuted },
            i < strikes && { textShadowColor: colors.accentPrimaryGlow, textShadowRadius: 8 }
          ]}>
            {letter}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <GameHeader
        gameName="Custom Bingo"
        player1={player1}
        player2={player2}
        currentTurn={currentState.currentPlayer}
        roomCode={isLocal ? null : roomId}
        onLeave={handleLeave}
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Status Bar */}
        <View style={[styles.statusBar, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
          {currentState.gamePhase === 'setup' && (
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>
              Setup Phase: Tap cells to place your numbers
            </Text>
          )}
          {currentState.gamePhase === 'playing' && (
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>
              {currentState.currentPlayer === 1 ? player1.name : player2.name}'s turn to call a number
            </Text>
          )}
          {currentState.gamePhase === 'ended' && (
            <Text style={[styles.statusText, { color: colors.accentPrimary }]}>
              Game Over!
            </Text>
          )}
        </View>

        {/* Boards */}
        <View style={styles.boards}>
          {/* Player 1 Board */}
          {showBoard1 && (
            <View style={[
              styles.boardSection, 
              (currentState.gamePhase === 'playing' && currentState.currentPlayer === 1) && { borderColor: colors.accentPrimary, borderWidth: 2 }
            ]}>
              <View style={styles.boardHeader}>
                <Text style={[styles.boardLabel, { color: colors.textPrimary }]}>{player1.avatar} {player1.name}</Text>
                {currentState.gamePhase === 'setup' && currentState.setupNum1 <= 25 && (
                  <Text style={[styles.setupBadge, { backgroundColor: colors.accentPrimary, color: 'white' }]}>
                    Place {currentState.setupNum1}
                  </Text>
                )}
                {currentState.gamePhase === 'setup' && currentState.setupNum1 > 25 && (
                  <Text style={[styles.setupBadge, { backgroundColor: colors.accentSuccess, color: 'white' }]}>
                    Ready
                  </Text>
                )}
              </View>
              {currentState.gamePhase !== 'setup' && renderBingoWord(currentState.strikes1)}
              <BingoBoard
                board={currentState.board1}
                onCellClick={(r, c) => handleCellClick(1, r, c)}
                disabled={currentState.gamePhase === 'ended'}
                winningCells={currentState.winningCells1}
              />
            </View>
          )}

          {/* Player 2 Board */}
          {showBoard2 && (
            <View style={[
              styles.boardSection, 
              (currentState.gamePhase === 'playing' && currentState.currentPlayer === 2) && { borderColor: colors.accentPrimary, borderWidth: 2 }
            ]}>
              <View style={styles.boardHeader}>
                <Text style={[styles.boardLabel, { color: colors.textPrimary }]}>{player2.avatar} {player2.name}</Text>
                {currentState.gamePhase === 'setup' && currentState.setupNum2 <= 25 && (
                  <Text style={[styles.setupBadge, { backgroundColor: colors.accentPrimary, color: 'white' }]}>
                    Place {currentState.setupNum2}
                  </Text>
                )}
                {currentState.gamePhase === 'setup' && currentState.setupNum2 > 25 && (
                  <Text style={[styles.setupBadge, { backgroundColor: colors.accentSuccess, color: 'white' }]}>
                    Ready
                  </Text>
                )}
              </View>
              {currentState.gamePhase !== 'setup' && renderBingoWord(currentState.strikes2)}
              <BingoBoard
                board={currentState.board2}
                onCellClick={(r, c) => handleCellClick(2, r, c)}
                disabled={currentState.gamePhase === 'ended'}
                winningCells={currentState.winningCells2}
              />
            </View>
          )}
        </View>

        {/* Winner */}
        {currentState.gamePhase === 'ended' && currentState.winner && (
          <View style={[styles.result, { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder }, shadows.lg]}>
            <Text style={styles.resultCelebration}>🎉</Text>
            <Text style={[styles.resultBingo, { color: colors.accentPrimary }]}>BINGO!</Text>
            <Text style={[styles.resultWinner, { color: colors.textPrimary }]}>
              {currentState.winner === 1 ? `${player1.avatar} ${player1.name}` : `${player2.avatar} ${player2.name}`} wins!
            </Text>
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accentPrimary }]} onPress={handleRematch}>
                <Text style={styles.actionBtnText}>New Game 🔄</Text>
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
  statusBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    marginBottom: spacing.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  statusText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
  },
  boards: { gap: spacing['2xl'], width: '100%', alignItems: 'center' },
  boardSection: { borderRadius: radius['2xl'], borderWidth: 1, borderColor: 'transparent', padding: spacing.sm },
  boardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.md },
  boardLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg },
  setupBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, overflow: 'hidden', fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  bingoWord: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  bingoLetter: { fontFamily: fonts.display, fontSize: fontSize['2xl'] },
  result: {
    marginTop: spacing['2xl'],
    padding: spacing['2xl'],
    borderRadius: radius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  resultCelebration: { fontSize: 48 },
  resultBingo: { fontFamily: fonts.display, fontSize: fontSize['4xl'], marginVertical: spacing.sm },
  resultWinner: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, marginBottom: spacing.xl },
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

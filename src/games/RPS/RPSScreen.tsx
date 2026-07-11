import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../../context/ThemeContext';
import { useMultiplayer } from '../../context/MultiplayerContext';
import GameHeader from '../../components/GameHeader';
import { createInitialState, submitChoice, processRoundEnd, nextRound, PLAYER_1, PLAYER_2, Choice } from './logic';
import { radius, spacing, shadows, TOUCH_MIN } from '../../theme/spacing';
import { fontSize, fonts } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RPS'>;

const EMOJI_MAP: Record<NonNullable<Choice>, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
};

export default function RPSScreen({ route, navigation }: Props) {
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

  const player1 = isLocal ? { id: 1, name: 'Player 1', avatar: '🔴' } : multiplayer.isHost ? myInfo : opponentInfo;
  const player2 = isLocal ? { id: 2, name: 'Player 2', avatar: '🟡' } : multiplayer.isHost ? opponentInfo : myInfo;

  const myPlayer = isLocal ? null : multiplayer.isHost ? PLAYER_1 : PLAYER_2;

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [displayHands, setDisplayHands] = useState<{p1: string, p2: string}>({ p1: '✊', p2: '✊' });

  useEffect(() => {
    if (currentState.phase === 'revealing') {
      setDisplayHands({ p1: '✊', p2: '✊' });
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 250, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 250, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 250, useNativeDriver: true })
      ]).start(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setDisplayHands({
          p1: EMOJI_MAP[currentState.p1Choice as NonNullable<Choice>],
          p2: EMOJI_MAP[currentState.p2Choice as NonNullable<Choice>]
        });
        
        if (isLocal || multiplayer.isHost) {
           const endState = processRoundEnd(currentState);
           if (endState) {
             if (isLocal) setGameState(endState);
             else multiplayer.updateGameState(endState);
           }
        }
      });
    } else if (currentState.phase === 'choosing') {
      setDisplayHands({ p1: '✊', p2: '✊' });
    }
  }, [currentState.phase]);

  const handleChoice = useCallback((choice: Choice) => {
    if (currentState.phase !== 'choosing') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isLocal) {
      let nextState = currentState;
      if (!currentState.p1Choice) {
        nextState = submitChoice(nextState, PLAYER_1, choice) || nextState;
      } else if (!currentState.p2Choice) {
        nextState = submitChoice(nextState, PLAYER_2, choice) || nextState;
      }
      setGameState(nextState);
    } else {
      if (!myPlayer) return;
      const nextState = submitChoice(currentState, myPlayer, choice);
      if (nextState) multiplayer.updateGameState(nextState);
    }
  }, [currentState, isLocal, myPlayer, multiplayer]);

  const handleNextRound = () => {
    if (!isLocal && !multiplayer.isHost) return;
    const nextState = nextRound(currentState);
    if (nextState) {
      if (isLocal) setGameState(nextState);
      else multiplayer.updateGameState(nextState);
    }
  };

  const handleRematch = () => {
    const freshState = createInitialState();
    if (isLocal) setGameState(freshState);
    else multiplayer.updateGameState(freshState);
  };

  const handleLeave = () => {
    if (!isLocal) multiplayer.leaveRoom();
    navigation.navigate('Lobby');
  };

  const shakeTranslateY = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-30, 0, 30]
  });

  const getStatusText = () => {
    if (!isLocal && !multiplayer.opponent) return 'Waiting for opponent...';
    if (currentState.phase === 'finished') {
       const winner = currentState.winner === PLAYER_1 ? player1 : player2;
       return `${winner.name} wins the game!`;
    }
    if (currentState.phase === 'roundEnd') {
       if (currentState.roundWinner === 'draw') return "It's a draw!";
       const rWinner = currentState.roundWinner === PLAYER_1 ? player1 : player2;
       return `${rWinner.name} wins Round ${currentState.round}`;
    }
    if (currentState.phase === 'revealing') return 'Rock, Paper, Scissors... Shoot!';
    
    if (isLocal) {
      if (!currentState.p1Choice) return `${player1.name}'s turn to choose`;
      return `${player2.name}'s turn to choose`;
    } else {
      const myChoice = myPlayer === PLAYER_1 ? currentState.p1Choice : currentState.p2Choice;
      if (!myChoice) return 'Make your choice!';
      return 'Waiting for opponent...';
    }
  };

  const isMyTurn = isLocal ? (!currentState.p1Choice || (currentState.p1Choice && !currentState.p2Choice)) : (myPlayer === PLAYER_1 ? !currentState.p1Choice : !currentState.p2Choice);
  const showControls = currentState.phase === 'choosing' && isMyTurn && (isLocal || multiplayer.opponent);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]} edges={['top', 'bottom', 'left', 'right']}>
      <GameHeader
        gameName="Rock Paper Scissors"
        player1={player1}
        player2={player2}
        currentTurn={0}
        roomCode={isLocal ? null : roomId}
        onLeave={handleLeave}
        navigation={navigation}
      />

      <View style={styles.content}>
        {/* Score Board */}
        <View style={[styles.scoreBoard, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statusText, { color: colors.textPrimary }]}>{getStatusText()}</Text>
          <View style={styles.scores}>
            <Text style={[styles.scoreText, { color: colors.accentPrimary }]}>{player1.name}: {currentState.p1Score}/3</Text>
            <Text style={[styles.scoreText, { color: colors.accentPrimary }]}>{player2.name}: {currentState.p2Score}/3</Text>
          </View>
        </View>

        {/* Battle Arena */}
        <View style={styles.arena}>
          <Animated.View style={[styles.handContainer, { transform: [{ translateY: shakeTranslateY }, { rotate: '90deg' }] }]}>
            <Text style={styles.handEmoji}>{displayHands.p1}</Text>
          </Animated.View>
          <Text style={[styles.vsText, { color: colors.textSecondary }]}>VS</Text>
          <Animated.View style={[styles.handContainer, { transform: [{ translateY: shakeTranslateY }, { rotate: '-90deg' }] }]}>
            <Text style={styles.handEmoji}>{displayHands.p2}</Text>
          </Animated.View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {showControls ? (
            <View style={styles.choices}>
              {(['rock', 'paper', 'scissors'] as Choice[]).map((c) => (
                <TouchableOpacity
                  key={c!}
                  style={[styles.choiceBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder, ...shadows.md }]}
                  onPress={() => handleChoice(c)}
                >
                  <Text style={styles.choiceEmoji}>{EMOJI_MAP[c!]}</Text>
                  <Text style={[styles.choiceLabel, { color: colors.textPrimary }]}>{c?.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : currentState.phase === 'roundEnd' && (isLocal || multiplayer.isHost) ? (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accentPrimary }]} onPress={handleNextRound}>
              <Text style={styles.actionBtnText}>Next Round</Text>
            </TouchableOpacity>
          ) : currentState.phase === 'finished' ? (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accentPrimary }]} onPress={handleRematch}>
              <Text style={styles.actionBtnText}>Rematch 🔄</Text>
            </TouchableOpacity>
          ) : (
            <View style={{height: 80}} /> // Placeholder to prevent layout shift
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  scoreBoard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    width: '100%',
    maxWidth: 400,
    marginTop: spacing.sm,
  },
  statusText: { fontSize: fontSize.lg, fontFamily: fonts.display, marginBottom: spacing.md, textAlign: 'center' },
  scores: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: spacing.xl },
  scoreText: { fontSize: fontSize.base, fontFamily: fonts.bodySemiBold },
  arena: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 360,
    marginVertical: spacing['3xl'],
  },
  handContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handEmoji: { fontSize: 80 },
  vsText: { fontSize: fontSize['2xl'], fontFamily: fonts.display },
  controlsContainer: {
    width: '100%',
    maxWidth: 400,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  choices: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  choiceBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    width: 90,
  },
  choiceEmoji: { fontSize: 40, marginBottom: spacing.xs },
  choiceLabel: { fontSize: fontSize.xs, fontFamily: fonts.bodyMedium },
  actionBtn: {
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    minHeight: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  actionBtnText: { color: 'white', fontSize: fontSize.lg, fontFamily: fonts.bodySemiBold },
});

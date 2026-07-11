import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../../context/ThemeContext';
import { useMultiplayer } from '../../context/MultiplayerContext';
import GameHeader from '../../components/GameHeader';
import Board from './Board';
import { 
  createInitialSharedState, 
  generateRandomPlacements, 
  checkShotResult, 
  isGameOver,
  PLAYER_1, 
  PLAYER_2,
  ShipPlacement,
  SharedGameState
} from './logic';
import { spacing, radius, shadows, TOUCH_MIN } from '../../theme/spacing';
import { fontSize, fonts } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Battleship'>;

export default function BattleshipScreen({ route, navigation }: Props) {
  const { roomId, isLocal } = route.params;
  const { player } = usePlayer();
  const { colors } = useTheme();
  const multiplayer = useMultiplayer();

  // Shared State
  const [localSharedState, setLocalSharedState] = useState<SharedGameState>(createInitialSharedState());
  const sharedState = (!isLocal && multiplayer.gameState) ? (multiplayer.gameState as SharedGameState) : localSharedState;

  // Local Private State
  const [p1Ships, setP1Ships] = useState<ShipPlacement[]>([]);
  const [p2Ships, setP2Ships] = useState<ShipPlacement[]>([]);
  
  // Local Play specific state
  const [showPassScreen, setShowPassScreen] = useState(isLocal);
  const [localActivePlayer, setLocalActivePlayer] = useState(PLAYER_1);

  const myPlayerNum = isLocal ? localActivePlayer : (multiplayer.isHost ? PLAYER_1 : PLAYER_2);
  const myShips = myPlayerNum === PLAYER_1 ? p1Ships : p2Ships;
  const myShots = myPlayerNum === PLAYER_1 ? sharedState.p1Shots : sharedState.p2Shots;
  const oppShots = myPlayerNum === PLAYER_1 ? sharedState.p2Shots : sharedState.p1Shots;

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

  // Generate random ships initially
  useEffect(() => {
    if (p1Ships.length === 0) setP1Ships(generateRandomPlacements());
    if (p2Ships.length === 0) setP2Ships(generateRandomPlacements());
  }, []);

  // Online Async Shot Resolution
  useEffect(() => {
    if (isLocal || !sharedState.pendingShot || sharedState.winner) return;

    // If opponent fired a shot, resolve it against my ships
    if (sharedState.pendingShot.player !== myPlayerNum) {
      const result = checkShotResult(sharedState.pendingShot.r, sharedState.pendingShot.c, myShips);
      
      const newMyShips = result.updatedShips;
      if (myPlayerNum === PLAYER_1) setP1Ships(newMyShips);
      else setP2Ships(newMyShips);

      const newShot = {
        r: sharedState.pendingShot.r,
        c: sharedState.pendingShot.c,
        result: result.result,
        shipId: result.shipId,
      };

      const newOppShots = [...(myPlayerNum === PLAYER_1 ? sharedState.p2Shots : sharedState.p1Shots), newShot];
      
      const isOver = isGameOver(newMyShips);
      const winner = isOver ? (myPlayerNum === PLAYER_1 ? PLAYER_2 : PLAYER_1) : null;

      multiplayer.updateGameState({
        ...sharedState,
        p1Shots: myPlayerNum === PLAYER_1 ? sharedState.p1Shots : newOppShots,
        p2Shots: myPlayerNum === PLAYER_2 ? sharedState.p2Shots : newOppShots,
        pendingShot: null,
        currentPlayer: myPlayerNum, // switch turn to me
        winner
      });
    }
  }, [sharedState.pendingShot, isLocal, myPlayerNum, myShips, sharedState, multiplayer]);

  const updateState = (newState: Partial<SharedGameState>) => {
    const fullState = { ...sharedState, ...newState };
    if (isLocal) setLocalSharedState(fullState as SharedGameState);
    else multiplayer.updateGameState(fullState);
  };

  const handleReady = () => {
    if (isLocal) {
      if (localActivePlayer === PLAYER_1) {
        updateState({ p1Ready: true });
        setLocalActivePlayer(PLAYER_2);
        setShowPassScreen(true);
      } else {
        updateState({ p2Ready: true, phase: 'combat' });
        setLocalActivePlayer(PLAYER_1);
        setShowPassScreen(true);
      }
    } else {
      const newState = { ...(myPlayerNum === PLAYER_1 ? { p1Ready: true } : { p2Ready: true }) };
      const willBeCombat = (myPlayerNum === PLAYER_1 && sharedState.p2Ready) || (myPlayerNum === PLAYER_2 && sharedState.p1Ready);
      if (willBeCombat) (newState as any).phase = 'combat';
      updateState(newState);
    }
  };

  const handleFire = (r: number, c: number) => {
    if (sharedState.phase !== 'combat' || sharedState.winner) return;
    if (sharedState.currentPlayer !== myPlayerNum) return;
    
    // Don't fire at same cell twice
    if (myShots.some(s => s.r === r && s.c === c)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isLocal) {
      // Synchronous resolution for local play
      const oppShips = myPlayerNum === PLAYER_1 ? p2Ships : p1Ships;
      const result = checkShotResult(r, c, oppShips);
      
      if (myPlayerNum === PLAYER_1) setP2Ships(result.updatedShips);
      else setP1Ships(result.updatedShips);

      const newShot = { r, c, result: result.result, shipId: result.shipId };
      const newMyShots = [...myShots, newShot];
      
      const isOver = isGameOver(result.updatedShips);
      const winner = isOver ? myPlayerNum : null;

      updateState({
        p1Shots: myPlayerNum === PLAYER_1 ? newMyShots : sharedState.p1Shots,
        p2Shots: myPlayerNum === PLAYER_2 ? newMyShots : sharedState.p2Shots,
        currentPlayer: myPlayerNum === PLAYER_1 ? PLAYER_2 : PLAYER_1,
        winner
      });

      if (!isOver) setShowPassScreen(true);
      setLocalActivePlayer(myPlayerNum === PLAYER_1 ? PLAYER_2 : PLAYER_1);

    } else {
      // Async resolution for online play
      updateState({
        pendingShot: { player: myPlayerNum, r, c, id: Math.random().toString() }
      });
    }
  };

  const randomizeShips = () => {
    if (myPlayerNum === PLAYER_1) setP1Ships(generateRandomPlacements());
    else setP2Ships(generateRandomPlacements());
    Haptics.selectionAsync();
  };

  const handleLeave = () => {
    if (!isLocal) multiplayer.leaveRoom();
  };

  if (showPassScreen && isLocal) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.title, { color: colors.textPrimary, marginBottom: spacing['3xl'] }]}>
          Pass phone to Player {localActivePlayer}
        </Text>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.accentPrimary, paddingHorizontal: 40 }]}
          onPress={() => setShowPassScreen(false)}
        >
          <Text style={styles.actionBtnText}>I'm Ready</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isMyTurn = sharedState.currentPlayer === myPlayerNum;
  const oppReady = myPlayerNum === PLAYER_1 ? sharedState.p2Ready : sharedState.p1Ready;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]} edges={['top', 'bottom', 'left', 'right']}>
      <GameHeader
        gameName="Battleship"
        player1={player1}
        player2={player2}
        currentTurn={sharedState.currentPlayer}
        roomCode={isLocal ? null : roomId}
        onLeave={handleLeave}
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.content}>
        
        {sharedState.phase === 'placement' && (
          <View style={styles.phaseContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Deploy your fleet</Text>
            <Board ships={myShips} shots={[]} />
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btnOutline, { borderColor: colors.glassBorder }]} onPress={randomizeShips}>
                <Text style={[styles.btnOutlineText, { color: colors.textPrimary }]}>Randomize</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accentPrimary }]} onPress={handleReady}>
                <Text style={styles.actionBtnText}>Ready</Text>
              </TouchableOpacity>
            </View>
            {!isLocal && oppReady && <Text style={{ color: colors.accentSuccess, marginTop: 10 }}>Opponent is ready!</Text>}
          </View>
        )}

        {sharedState.phase === 'combat' && (
          <View style={styles.phaseContainer}>
            {!sharedState.winner && (
              <Text style={[styles.title, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                {isMyTurn ? "Your turn to fire!" : "Waiting for opponent..."}
              </Text>
            )}

            <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Opponent's Waters</Text>
            <Board 
              ships={isLocal ? (myPlayerNum === PLAYER_1 ? p2Ships : p1Ships) : []} 
              shots={myShots} 
              onCellClick={handleFire}
              disabled={!isMyTurn || !!sharedState.winner || !!sharedState.pendingShot}
              hideShips={!isLocal || !sharedState.winner} // In local, only show at end
            />

            <View style={{ height: 24 }} />

            <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Your Waters</Text>
            <Board 
              ships={myShips} 
              shots={oppShots} 
              disabled={true}
            />
          </View>
        )}

        {/* Result */}
        {sharedState.winner && (
          <View style={[styles.result, { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder }, shadows.lg]}>
            <Text style={[styles.resultTitle, { color: colors.accentPrimary }]}>
              {sharedState.winner === PLAYER_1 ? player1.name : player2.name} Wins! 🎉
            </Text>
            <View style={styles.resultActions}>
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
  phaseContainer: { alignItems: 'center', width: '100%' },
  title: { fontFamily: fonts.display, fontSize: fontSize.xl, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  btnOutline: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: { fontFamily: fonts.bodyMedium },
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

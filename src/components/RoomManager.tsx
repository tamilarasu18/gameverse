import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import { spacing, radius, shadows, TOUCH_MIN } from '../theme/spacing';
import { fontSize, fonts } from '../theme/typography';

interface RoomManagerProps {
  gameType: string;
  gameName: string;
  onRoomReady: (roomCode: string, isLocal: boolean) => void;
  onCancel: () => void;
  multiplayer: any; // from useMultiplayer hook
}

export default function RoomManager({ gameType, gameName, onRoomReady, onCancel, multiplayer }: RoomManagerProps) {
  const { player } = usePlayer();
  const { colors } = useTheme();
  const [mode, setMode] = useState<'select' | 'create' | 'join' | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const { roomCode, status, error, createRoom, joinRoom, online } = multiplayer;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my game of ${gameName} on GameVerse! Room code: ${roomCode}`,
      });
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };
  const handleCreate = async () => {
    setMode('create');
    await createRoom(gameType, player);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    const success = await joinRoom(joinCode, player);
    if (success) onRoomReady(joinCode, false);
  };

  const handleLocalPlay = () => {
    onRoomReady('LOCAL', true);
  };

  if (status === 'playing' && mode === 'create') {
    onRoomReady(roomCode, false);
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <TouchableOpacity activeOpacity={1} style={[styles.modal, { backgroundColor: colors.bgSecondary, borderColor: colors.glassBorder }, shadows.xl]}>
          {/* Close */}
          <TouchableOpacity onPress={onCancel} style={[styles.closeBtn, { backgroundColor: colors.bgSurface }]}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Header */}
          <Text style={[styles.title, { color: colors.accentPrimary }]}>{gameName}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose how to play</Text>

          {/* Options */}
          {!mode && (
            <View style={styles.options}>
              <TouchableOpacity
                style={[styles.option, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}
                onPress={handleLocalPlay}
              >
                <View style={[styles.optionIcon, { backgroundColor: 'rgba(93, 170, 114, 0.12)' }]}>
                  <Feather name="smartphone" size={22} color={colors.accentSuccess} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>Local Play</Text>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>Two players, one device</Text>
                </View>
              </TouchableOpacity>

              {online ? (
                <>
                  <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}
                    onPress={handleCreate}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: 'rgba(196, 132, 94, 0.12)' }]}>
                      <Feather name="globe" size={22} color={colors.accentPrimary} />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>Create Room</Text>
                      <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>Get a code for your friend</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}
                    onPress={() => setMode('join')}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: 'rgba(212, 160, 78, 0.12)' }]}>
                      <Feather name="link" size={22} color={colors.accentWarning} />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>Join Room</Text>
                      <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>Enter a friend's room code</Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={[styles.offlineNotice, { borderColor: 'rgba(212, 160, 78, 0.15)' }]}>
                  <Feather name="wifi-off" size={28} color={colors.accentWarning} />
                  <Text style={[styles.offlineText, { color: colors.textSecondary }]}>
                    Online multiplayer requires Firebase setup.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Waiting for opponent */}
          {mode === 'create' && status === 'waiting' && (
            <View style={styles.waiting}>
              <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>ROOM CODE</Text>
              <TouchableOpacity style={[styles.codeDisplay, { backgroundColor: colors.bgTertiary }]} onPress={handleShare}>
                <Text style={[styles.codeText, { color: colors.accentPrimary }]}>{roomCode}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]} onPress={handleShare}>
                <Feather name="share" size={16} color={colors.accentPrimary} />
                <Text style={[styles.shareText, { color: colors.textPrimary }]}>Share with friend</Text>
              </TouchableOpacity>
              <ActivityIndicator color={colors.accentPrimary} style={{ marginTop: spacing.lg }} />
              <Text style={[styles.waitingText, { color: colors.textSecondary }]}>Waiting for opponent...</Text>
            </View>
          )}

          {/* Join form */}
          {mode === 'join' && (
            <View style={styles.joinForm}>
              <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>ENTER ROOM CODE</Text>
              <TextInput
                style={[styles.codeInput, { backgroundColor: colors.bgInput, borderColor: colors.glassBorder, color: colors.textPrimary }]}
                placeholder="ABC123"
                placeholderTextColor={colors.textMuted}
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect={false}
                value={joinCode}
                onChangeText={(t) => setJoinCode(t.toUpperCase())}
                onSubmitEditing={handleJoin}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.joinBtn, { backgroundColor: colors.accentPrimary, opacity: joinCode.length < 6 ? 0.5 : 1 }]}
                onPress={handleJoin}
                disabled={joinCode.length < 6 || status === 'joining'}
              >
                {status === 'joining' ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.joinBtnText}>Join Game</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode(null)} style={styles.backLink}>
                <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={[styles.error, { backgroundColor: 'rgba(200, 90, 90, 0.1)', borderColor: 'rgba(200, 90, 90, 0.25)' }]}>
              <Feather name="alert-circle" size={14} color={colors.accentDanger} />
              <Text style={[styles.errorText, { color: colors.accentDanger }]}>{error}</Text>
            </View>
          )}

          {/* Creating */}
          {status === 'creating' && (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.accentPrimary} size="large" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Creating room...</Text>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    padding: spacing['3xl'],
    width: '100%',
    maxWidth: 420,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize['2xl'],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    marginBottom: spacing['2xl'],
  },
  options: { gap: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    minHeight: 72,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1 },
  optionLabel: { fontFamily: fonts.bodyBold, fontSize: fontSize.base },
  optionDesc: { fontSize: fontSize.sm, marginTop: 2 },
  offlineNotice: {
    alignItems: 'center',
    padding: spacing['2xl'],
    borderWidth: 1,
    borderRadius: radius.xl,
    gap: spacing.sm,
  },
  offlineText: { fontSize: fontSize.sm, textAlign: 'center' },
  waiting: { alignItems: 'center' },
  codeLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  codeDisplay: {
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
  },
  codeText: {
    fontFamily: fonts.display,
    fontSize: fontSize['3xl'],
    letterSpacing: 6,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  shareText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
  },
  waitingText: { fontSize: fontSize.sm, marginTop: spacing.sm },
  joinForm: { alignItems: 'center' },
  codeInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: fontSize['2xl'],
    fontFamily: fonts.display,
    letterSpacing: 8,
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    minHeight: TOUCH_MIN,
  },
  joinBtn: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_MIN,
  },
  joinBtnText: { color: 'white', fontSize: fontSize.base, fontFamily: fonts.bodySemiBold },
  backLink: { marginTop: spacing.md, padding: spacing.sm },
  backLinkText: { fontSize: fontSize.sm },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  errorText: { fontSize: fontSize.sm, flex: 1 },
  loading: { alignItems: 'center', padding: spacing['3xl'] },
  loadingText: { marginTop: spacing.md, fontSize: fontSize.sm },
});

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  database,
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  onDisconnect,
  runTransaction,
  generateRoomCode,
  isFirebaseConfigured,
} from '../config/firebase';

interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
}

interface RoomData {
  gameType: string;
  status: 'waiting' | 'playing';
  createdAt: number;
  host: PlayerInfo;
  guest: PlayerInfo | null;
  gameState: any;
  gameStateStr?: string;
}

type MultiplayerStatus = 'idle' | 'creating' | 'waiting' | 'joining' | 'playing' | 'error';

interface MultiplayerContextType<T = any> {
  room: RoomData | null;
  roomCode: string;
  gameState: T | null;
  opponent: PlayerInfo | null;
  isHost: boolean;
  status: MultiplayerStatus;
  error: string | null;
  online: boolean;
  createRoom: (gameType: string, player: PlayerInfo | null) => Promise<string | null>;
  joinRoom: (code: string, player: PlayerInfo | null) => Promise<boolean>;
  updateGameState: (newState: T) => Promise<void>;
  mergeGameState: (updater: (prev: T | null) => T) => Promise<void>;
  leaveRoom: () => Promise<void>;
}

const MultiplayerContext = createContext<MultiplayerContextType | null>(null);

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [gameState, setGameState] = useState<any>(null);
  const [opponent, setOpponent] = useState<PlayerInfo | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [status, setStatus] = useState<MultiplayerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const roomCodeRef = useRef('');

  const online = isFirebaseConfigured();

  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  const createRoom = useCallback(async (gameType: string, player: PlayerInfo | null) => {
    if (!online || !database || !player) {
      setError('Firebase not configured or player not set.');
      setStatus('error');
      return null;
    }

    setStatus('creating');
    setError(null);

    try {
      let code = generateRoomCode();
      for (let attempt = 0; attempt < 5; attempt++) {
        const snapshot = await get(ref(database, `rooms/${code}`));
        if (!snapshot.exists()) break;
        code = generateRoomCode();
      }

      const roomData: RoomData = {
        gameType,
        status: 'waiting',
        createdAt: Date.now(),
        host: { id: player.id, name: player.name, avatar: player.avatar },
        guest: null,
        gameState: null,
      };

      await set(ref(database, `rooms/${code}`), roomData);
      onDisconnect(ref(database, `rooms/${code}`)).remove();

      setRoomCode(code);
      roomCodeRef.current = code;
      setIsHost(true);
      setStatus('waiting');

      const unsubscribe = onValue(ref(database, `rooms/${code}`), (snapshot) => {
        const data = snapshot.val() as RoomData | null;
        if (!data) { setStatus('idle'); setRoom(null); return; }
        setRoom(data);
        if (data.guest) {
          setOpponent(data.guest);
          if (data.status === 'waiting') {
            update(ref(database!, `rooms/${roomCodeRef.current}`), { status: 'playing' });
          }
        } else {
          setOpponent(null);
        }
        if (data.gameStateStr) {
          try { setGameState(JSON.parse(data.gameStateStr)); } catch (e) { setGameState(null); }
        } else if (data.gameState) {
          setGameState(data.gameState);
        } else {
          setGameState(null);
        }
        if (data.status === 'playing') setStatus('playing');
      });

      unsubscribeRef.current = unsubscribe;
      return code;
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
      return null;
    }
  }, [online]);

  const joinRoom = useCallback(async (code: string, player: PlayerInfo | null) => {
    if (!online || !database || !player) {
      setError('Firebase not configured or player not set.');
      setStatus('error');
      return false;
    }

    setStatus('joining');
    setError(null);
    code = code.toUpperCase().trim();

    try {
      const snapshot = await get(ref(database, `rooms/${code}`));
      if (!snapshot.exists()) { setError('Room not found.'); setStatus('idle'); return false; }

      const roomData = snapshot.val() as RoomData;
      if (roomData.guest) { setError('Room is full.'); setStatus('idle'); return false; }
      if (roomData.host.id === player.id) { setError('You cannot join your own room.'); setStatus('idle'); return false; }

      await update(ref(database, `rooms/${code}`), {
        guest: { id: player.id, name: player.name, avatar: player.avatar },
        status: 'playing',
      });

      onDisconnect(ref(database, `rooms/${code}/guest`)).remove();

      setRoomCode(code);
      roomCodeRef.current = code;
      setIsHost(false);
      setOpponent(roomData.host);
      setStatus('playing');

      const unsubscribe = onValue(ref(database, `rooms/${code}`), (snapshot) => {
        const data = snapshot.val() as RoomData | null;
        if (!data) { setStatus('idle'); setRoom(null); return; }
        setRoom(data);
        if (data.gameStateStr) {
          try { setGameState(JSON.parse(data.gameStateStr)); } catch (e) { setGameState(null); }
        } else if (data.gameState) {
          setGameState(data.gameState);
        } else {
          setGameState(null);
        }
      });

      unsubscribeRef.current = unsubscribe;
      return true;
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
      return false;
    }
  }, [online]);

  const updateGameState = useCallback(async (newState: any) => {
    if (!online || !database || !roomCodeRef.current) return;
    try {
      const stateStr = JSON.stringify(newState);
      await update(ref(database, `rooms/${roomCodeRef.current}`), { gameStateStr: stateStr });
    } catch (err: any) {
      console.error('Failed to update game state:', err);
    }
  }, [online]);

  // Concurrency-safe update: reads the freshest server value and applies `updater`
  // inside a transaction, so simultaneous writers (e.g. both players placing during
  // a shared setup phase) merge instead of clobbering each other.
  const mergeGameState = useCallback(async (updater: (prev: any) => any) => {
    if (!online || !database || !roomCodeRef.current) return;
    try {
      await runTransaction(
        ref(database, `rooms/${roomCodeRef.current}/gameStateStr`),
        (currStr: string | null) => {
          const prev = currStr ? JSON.parse(currStr) : null;
          return JSON.stringify(updater(prev));
        }
      );
    } catch (err: any) {
      console.error('Failed to merge game state:', err);
    }
  }, [online]);

  const leaveRoom = useCallback(async () => {
    cleanup();
    if (online && database && roomCodeRef.current) {
      try {
        if (isHost) {
          await remove(ref(database, `rooms/${roomCodeRef.current}`));
        } else {
          await update(ref(database, `rooms/${roomCodeRef.current}`), {
            guest: null, status: 'waiting', gameState: null,
          });
        }
      } catch (err: any) {
        console.error('Failed to leave room:', err);
      }
    }
    setRoom(null);
    setRoomCode('');
    roomCodeRef.current = '';
    setGameState(null);
    setOpponent(null);
    setIsHost(false);
    setStatus('idle');
    setError(null);
  }, [cleanup, isHost, online]);

  useEffect(() => () => { cleanup(); }, [cleanup]);

  const value = {
    room,
    roomCode,
    gameState,
    opponent,
    isHost,
    status,
    error,
    online,
    createRoom,
    joinRoom,
    updateGameState,
    mergeGameState,
    leaveRoom,
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer<T = any>(): MultiplayerContextType<T> {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context as unknown as MultiplayerContextType<T>;
}

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  database,
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  onDisconnect,
  generateRoomCode,
  isFirebaseConfigured
} from '../config/firebase';

export function useMultiplayer() {
  const [room, setRoom] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [gameState, setGameState] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, creating, waiting, joining, playing, error
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);
  const roomCodeRef = useRef('');

  const online = isFirebaseConfigured();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  // Create a new room
  const createRoom = useCallback(async (gameType, player) => {
    if (!online) {
      setError('Firebase not configured. Running in local mode.');
      setStatus('error');
      return null;
    }

    setStatus('creating');
    setError(null);

    try {
      let code = generateRoomCode();
      // Check for collision
      const snapshot = await get(ref(database, `rooms/${code}`));
      if (snapshot.exists()) {
        code = generateRoomCode();
      }

      const roomData = {
        gameType,
        status: 'waiting',
        createdAt: Date.now(),
        host: {
          id: player.id,
          name: player.name,
          avatar: player.avatar
        },
        guest: null,
        gameState: null
      };

      await set(ref(database, `rooms/${code}`), roomData);

      // Set up disconnect cleanup
      onDisconnect(ref(database, `rooms/${code}/host`)).remove();

      setRoomCode(code);
      roomCodeRef.current = code;
      setIsHost(true);
      setStatus('waiting');

      // Listen for room changes
      const unsubscribe = onValue(ref(database, `rooms/${code}`), (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setStatus('idle');
          setRoom(null);
          return;
        }
        setRoom(data);

        if (data.guest) {
          setOpponent(data.guest);
          if (data.status === 'waiting') {
            update(ref(database, `rooms/${roomCodeRef.current}`), { status: 'playing' });
          }
        }

        if (data.gameState) {
          setGameState(data.gameState);
        }

        if (data.status === 'playing') {
          setStatus('playing');
        }
      });

      unsubscribeRef.current = unsubscribe;
      return code;
    } catch (err) {
      setError(err.message);
      setStatus('error');
      return null;
    }
  }, [online]);

  // Join an existing room
  const joinRoom = useCallback(async (code, player) => {
    if (!online) {
      setError('Firebase not configured. Running in local mode.');
      setStatus('error');
      return false;
    }

    setStatus('joining');
    setError(null);
    code = code.toUpperCase().trim();

    try {
      const snapshot = await get(ref(database, `rooms/${code}`));

      if (!snapshot.exists()) {
        setError('Room not found. Check the code and try again.');
        setStatus('idle');
        return false;
      }

      const roomData = snapshot.val();

      if (roomData.guest) {
        setError('Room is full.');
        setStatus('idle');
        return false;
      }

      if (roomData.host.id === player.id) {
        setError('You cannot join your own room.');
        setStatus('idle');
        return false;
      }

      // Join the room
      await update(ref(database, `rooms/${code}`), {
        guest: {
          id: player.id,
          name: player.name,
          avatar: player.avatar
        },
        status: 'playing'
      });

      // Set up disconnect cleanup
      onDisconnect(ref(database, `rooms/${code}/guest`)).remove();

      setRoomCode(code);
      roomCodeRef.current = code;
      setIsHost(false);
      setOpponent(roomData.host);
      setStatus('playing');

      // Listen for room changes
      const unsubscribe = onValue(ref(database, `rooms/${code}`), (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setStatus('idle');
          setRoom(null);
          return;
        }
        setRoom(data);

        if (data.gameState) {
          setGameState(data.gameState);
        }
      });

      unsubscribeRef.current = unsubscribe;
      return true;
    } catch (err) {
      setError(err.message);
      setStatus('error');
      return false;
    }
  }, [online]);

  // Update game state
  const updateGameState = useCallback(async (newState) => {
    if (!online || !roomCodeRef.current) return;

    try {
      await update(ref(database, `rooms/${roomCodeRef.current}`), {
        gameState: newState
      });
    } catch (err) {
      console.error('Failed to update game state:', err);
    }
  }, [online]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    cleanup();

    if (online && roomCodeRef.current) {
      try {
        if (isHost) {
          await remove(ref(database, `rooms/${roomCodeRef.current}`));
        } else {
          await update(ref(database, `rooms/${roomCodeRef.current}`), {
            guest: null,
            status: 'waiting',
            gameState: null
          });
        }
      } catch (err) {
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
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
    leaveRoom
  };
}

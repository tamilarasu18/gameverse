import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

interface PlayerContextValue {
  player: Player | null;
  createProfile: (name: string, avatar: string) => Player;
  updateProfile: (updates: Partial<Player>) => void;
  clearProfile: () => Promise<void>;
  AVATARS: readonly string[];
}

const PlayerContext = createContext<PlayerContextValue | null>(null);
const STORAGE_KEY = 'gameverse_player';

export const AVATARS = ['🦊', '🐼', '🦁', '🐲', '🦄', '🐺', '🦅', '🐙', '🦋', '🎮', '🚀', '⚡', '🔥', '💎', '🌟', '🎯'] as const;

function generatePlayerId(): string {
  return 'player_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setPlayer(JSON.parse(saved));
        }
      } catch {
        // Failed to load
      }
      setIsLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (player) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(player)).catch(() => {});
    }
  }, [player, isLoaded]);

  const createProfile = (name: string, avatar: string): Player => {
    const newPlayer: Player = {
      id: generatePlayerId(),
      name: name.trim() || 'Player',
      avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      createdAt: Date.now(),
    };
    setPlayer(newPlayer);
    return newPlayer;
  };

  const updateProfile = (updates: Partial<Player>) => {
    setPlayer(prev => prev ? { ...prev, ...updates } : null);
  };

  const clearProfile = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Failed to clear
    }
    setPlayer(null);
  };

  if (!isLoaded) return null;

  return (
    <PlayerContext.Provider value={{ player, createProfile, updateProfile, clearProfile, AVATARS }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
}

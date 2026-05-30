// Global Media Player Context - Persists across navigation
'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Types
export type MediaType = 'video' | 'audio';

export interface MediaItem {
  id: string;
  title: string;
  author?: string;
  type: MediaType;
  url: string;
  imageUrl?: string;
  description?: string;
}

// Player mode: normal (full), semi (medium), mini (compact)
export type PlayerMode = 'normal' | 'semi' | 'mini';

interface MediaPlayerState {
  currentMedia: MediaItem | null;
  isPlaying: boolean;
  isMinimized: boolean;
  playerMode: PlayerMode;
  volume: number;
  progress: number;
  duration: number;
}

interface MediaPlayerContextType extends MediaPlayerState {
  playMedia: (media: MediaItem) => void;
  pauseMedia: () => void;
  resumeMedia: () => void;
  stopMedia: () => void;
  toggleMinimize: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  seekTo: (time: number) => void;
  setPlayerMode: (mode: PlayerMode) => void;
  cyclePlayerMode: () => void;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export function MediaPlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MediaPlayerState>({
    currentMedia: null,
    isPlaying: false,
    isMinimized: false,
    playerMode: 'normal',
    volume: 0.7,
    progress: 0,
    duration: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play a new media item
  const playMedia = useCallback((media: MediaItem) => {
    setState(prev => ({
      ...prev,
      currentMedia: media,
      isPlaying: true,
      isMinimized: false,
      progress: 0,
    }));
  }, []);

  // Pause current media
  const pauseMedia = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Resume current media
  const resumeMedia = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  // Stop current media
  const stopMedia = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentMedia: null,
      isPlaying: false,
      progress: 0,
    }));
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Toggle minimize
  const toggleMinimize = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }));
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  // Set progress
  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  // Set duration
  const setDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, duration }));
  }, []);

  // Seek to time
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  // Set player mode
  const setPlayerMode = useCallback((mode: PlayerMode) => {
    setState(prev => ({ ...prev, playerMode: mode }));
  }, []);

  // Cycle through modes: semi -> normal -> mini -> semi
  const cyclePlayerMode = useCallback(() => {
    setState(prev => {
      const modes: PlayerMode[] = ['semi', 'normal', 'mini'];
      const currentIndex = modes.indexOf(prev.playerMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { ...prev, playerMode: modes[nextIndex] };
    });
  }, []);

  const value: MediaPlayerContextType = {
    ...state,
    playMedia,
    pauseMedia,
    resumeMedia,
    stopMedia,
    toggleMinimize,
    setVolume,
    setProgress,
    setDuration,
    seekTo,
    setPlayerMode,
    cyclePlayerMode,
  };

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayer() {
  const context = useContext(MediaPlayerContext);
  if (context === undefined) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
}

// Helper to get YouTube embed URL
export function getYouTubeEmbedUrl(url: string, autoplay: boolean = true): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const params = new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        rel: '0',
        modestbranding: '1',
      });
      return `https://www.youtube.com/embed/${match[1]}?${params.toString()}`;
    }
  }
  return null;
}

// Helper to get YouTube thumbnail
export function getYouTubeThumbnail(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }
  return null;
}

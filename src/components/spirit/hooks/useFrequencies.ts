// useFrequencies - Hook for managing frequency playback
'use client';

import { useState, useRef, useCallback } from 'react';
import type { Frequency } from '../types';
import { initialFrequencies } from '../constants';

export function useFrequencies() {
  const [frequencies, setFrequencies] = useState<Frequency[]>(initialFrequencies);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Generate tone frequency
  const playFrequency = useCallback((hz: number) => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = hz;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start();
    oscillatorRef.current = oscillator;
  }, []);

  // Stop frequency
  const stopFrequency = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Toggle frequency
  const toggleFrequency = useCallback((freq: Frequency) => {
    if (freq.isPlaying) {
      stopFrequency();
      setFrequencies(prev => prev.map(f => ({ ...f, isPlaying: false })));
    } else {
      const hzValue = parseInt(freq.hz);
      playFrequency(hzValue);
      setFrequencies(prev => prev.map(f => ({ ...f, isPlaying: f.id === freq.id })));
    }
  }, [playFrequency, stopFrequency]);

  return {
    frequencies,
    toggleFrequency,
  };
}

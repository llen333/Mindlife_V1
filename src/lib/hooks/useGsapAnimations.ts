/**
 * MindLife - GSAP Animation Hooks
 * Hooks réutilisables pour les animations GSAP
 */

import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * Hook pour les animations d'entrée standardisées
 */
export function useEntranceAnimation(dependencies: any[] = []) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, dependencies);

  return ref;
}

/**
 * Hook pour les animations de modales
 */
export function useModalAnimation(isOpen: boolean) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (overlayRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      }
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { scale: 0.95, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
        );
      }
    }
  }, [isOpen]);

  return { overlayRef, contentRef };
}

/**
 * Hook pour les animations staggerées de liste
 */
export function useStaggerAnimation(dependencies: any[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.children;
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.05,
          ease: 'power2.out' 
        }
      );
    }
  }, dependencies);

  return containerRef;
}

/**
 * Hook pour le timer ( GoalsPage)
 */
export function useTimer(initialMinutes: number = 25) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [seconds, setSeconds] = React.useState(initialMinutes * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback((newMinutes?: number) => {
    setSeconds((newMinutes || initialMinutes) * 60);
    setIsRunning(false);
    setIsPaused(false);
  }, [initialMinutes]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 0) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRunning,
    isPaused,
    seconds,
    formattedTime: formatTime(seconds),
    start,
    pause,
    resume,
    reset,
  };
}

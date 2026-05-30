/**
 * Hook pour les animations GSAP hover
 */

'use client';

import { useRef, useCallback } from 'react';
import gsap from 'gsap';

interface HoverOptions {
  scale?: number;
  y?: number;
  x?: number;
  duration?: number;
}

export function useGSAPHover(options: HoverOptions = {}) {
  const { scale = 1, y = 0, x = 0, duration = 0.2 } = options;
  
  const handleMouseEnter = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    gsap.to(element, {
      scale,
      y,
      x,
      duration,
      ease: 'power2.out',
    });
  }, [scale, y, x, duration]);
  
  const handleMouseLeave = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    gsap.to(element, {
      scale: 1,
      y: 0,
      x: 0,
      duration,
      ease: 'power2.out',
    });
  }, [duration]);
  
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => handleMouseEnter(e.currentTarget),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => handleMouseLeave(e.currentTarget),
  };
}

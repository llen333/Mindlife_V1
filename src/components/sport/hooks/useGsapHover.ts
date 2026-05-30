// useGsapHover - Hook for GSAP hover animations
'use client';

import { useCallback } from 'react';
import gsap from 'gsap';

export function useGsapHover(
  animationConfig: { scale?: number; y?: number; duration?: number } = {}
) {
  const { scale, y, duration = 0.15 } = animationConfig;

  return useCallback((el: HTMLElement | null) => {
    if (!el) return;

    const handleEnter = () => {
      if (scale !== undefined) {
        gsap.to(el, { scale, duration });
      }
      if (y !== undefined) {
        gsap.to(el, { y, duration });
      }
    };

    const handleLeave = () => {
      if (scale !== undefined) {
        gsap.to(el, { scale: 1, duration });
      }
      if (y !== undefined) {
        gsap.to(el, { y: 0, duration });
      }
    };

    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [scale, y, duration]);
}

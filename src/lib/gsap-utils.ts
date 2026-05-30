/**
 * GSAP Animation Utilities
 * Remplace Framer Motion par GSAP pour de meilleures performances
 */

import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

// Hook pour les animations d'entrée (fade in + slide up)
export function useGSAPEntry(delay = 0, duration = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration, delay, ease: 'power2.out' }
      )
    }
  }, [delay, duration])
  
  return ref
}

// Hook pour les animations de sortie
export function useGSAPExit() {
  const ref = useRef<HTMLDivElement>(null)
  
  const animateExit = useCallback((onComplete?: () => void) => {
    if (ref.current) {
      gsap.to(ref.current, {
        opacity: 0,
        y: -20,
        duration: 0.2,
        ease: 'power2.in',
        onComplete
      })
    }
  }, [])
  
  return { ref, animateExit }
}

// Hook pour les animations hover (scale + lift)
export function useGSAPHover(scale = 1.02, y = -2) {
  const ref = useRef<HTMLDivElement>(null)
  
  const handleMouseEnter = useCallback(() => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale,
        y,
        duration: 0.2,
        ease: 'power2.out'
      })
    }
  }, [scale, y])
  
  const handleMouseLeave = useCallback(() => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale: 1,
        y: 0,
        duration: 0.2,
        ease: 'power2.out'
      })
    }
  }, [])
  
  return { ref, handleMouseEnter, handleMouseLeave }
}

// Hook pour les animations de clic (tap effect)
export function useGSAPTap() {
  const ref = useRef<HTMLDivElement>(null)
  
  const handleMouseDown = useCallback(() => {
    if (ref.current) {
      gsap.to(ref.current, { scale: 0.98, duration: 0.1 })
    }
  }, [])
  
  const handleMouseUp = useCallback(() => {
    if (ref.current) {
      gsap.to(ref.current, { scale: 1, duration: 0.1 })
    }
  }, [])
  
  return { ref, handleMouseDown, handleMouseUp }
}

// Hook pour les animations de sidebar (width)
export function useGSAPSidebar(collapsed: boolean, width: number) {
  const ref = useRef<HTMLElement>(null)
  
  useEffect(() => {
    if (ref.current) {
      gsap.to(ref.current, {
        width,
        duration: 0.25,
        ease: 'power2.out'
      })
    }
  }, [collapsed, width])
  
  return ref
}

// Hook pour les animations stagger (listes)
export function useGSAPStagger(itemCount: number, staggerDelay = 0.05) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.children
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: staggerDelay,
          ease: 'power2.out'
        }
      )
    }
  }, [itemCount, staggerDelay])
  
  return containerRef
}

// Hook pour les animations de progression
export function useGSAPProgress(progress: number, delay = 0.5) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current) {
      gsap.to(ref.current, {
        width: `${progress}%`,
        duration: 0.8,
        delay,
        ease: 'power2.out'
      })
    }
  }, [progress, delay])
  
  return ref
}

// Hook pour les animations de cercle SVG (progress circulaire)
export function useGSAPCircleProgress(progress: number, circumference: number, delay = 0) {
  const ref = useRef<SVGCircleElement>(null)
  
  useEffect(() => {
    if (ref.current) {
      const strokeDasharray = (progress / 100) * circumference
      gsap.to(ref.current, {
        strokeDasharray: `${strokeDasharray} ${circumference}`,
        duration: 1.5,
        delay,
        ease: 'power2.out'
      })
    }
  }, [progress, circumference, delay])
  
  return ref
}

// Hook pour les animations d'apparition avec scale
export function useGSAPScaleIn(delay = 0, scale = 0.95) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, scale },
        { opacity: 1, scale: 1, duration: 0.3, delay, ease: 'back.out(1.7)' }
      )
    }
  }, [delay, scale])
  
  return ref
}

// Hook pour les animations infinies en CSS natif (REMPLACE les motion.div avec repeat: Infinity)
// IMPORTANT: Utiliser des keyframes CSS au lieu de JS pour les animations infinies
export function getCSSOrbKeyframes(name: string, keyframes: Record<string, string>): string {
  return `
    @keyframes ${name} {
      ${Object.entries(keyframes).map(([k, v]) => `${k} { ${v} }`).join('\n')}
    }
  `
}

// Configuration pour les orbes animés en CSS natif
export const ORB_KEYFRAMES = `
  @keyframes orb-float-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(100px, 50px) scale(1.2); }
    50% { transform: translate(50px, 100px) scale(0.9); }
    75% { transform: translate(-50px, 50px) scale(1.1); }
  }
  @keyframes orb-float-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(-80px, 80px) scale(0.8); }
    50% { transform: translate(-40px, 40px) scale(1.1); }
    75% { transform: translate(80px, -40px) scale(0.95); }
  }
  @keyframes orb-float-3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(60px, -60px) scale(1.1); }
    50% { transform: translate(-30px, 30px) scale(0.95); }
    75% { transform: translate(-60px, -30px) scale(1.05); }
  }
`

// Composant utilitaire pour wrapper avec GSAP context
export function createGSAPTimeline(config?: gsap.TimelineVars) {
  return gsap.timeline(config)
}

// Animation de shimmer (effet brillant)
export function useGSAPShimmer() {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current) {
      gsap.to(ref.current, {
        x: ['-100%', '100%'],
        duration: 1.5,
        repeat: -1,
        ease: 'none'
      })
    }
    return () => {
      if (ref.current) {
        gsap.killTweensOf(ref.current)
      }
    }
  }, [])
  
  return ref
}

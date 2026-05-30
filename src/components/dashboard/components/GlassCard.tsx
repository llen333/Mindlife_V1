'use client';

import { useEffect, useRef, memo } from 'react';
import { gsap } from 'gsap';
import { GLOW_COLORS } from '../constants';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hover?: boolean;
}

/**
 * Composant GlassCard avec effet glassmorphism et animations GSAP
 */
const GlassCard = memo(({ 
  children, className = '', glowColor = 'emerald', hover = true 
}: GlassCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hover || !cardRef.current) return;
    
    const card = cardRef.current;
    
    const handleMouseEnter = () => {
      gsap.to(card, { scale: 1.01, y: -2, duration: 0.2, ease: 'power2.out' });
    };
    
    const handleMouseLeave = () => {
      gsap.to(card, { scale: 1, y: 0, duration: 0.2, ease: 'power2.out' });
    };
    
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hover]);

  const glowClass = GLOW_COLORS[glowColor] || GLOW_COLORS.emerald;

  return (
    <div
      ref={cardRef}
      className={`
        relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]
        rounded-2xl shadow-xl shadow-black/20
        ${hover ? `hover:shadow-2xl ${glowClass} hover:border-white/[0.15]` : ''}
        before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.07] before:via-transparent before:to-transparent before:pointer-events-none
        ${className}
      `}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;

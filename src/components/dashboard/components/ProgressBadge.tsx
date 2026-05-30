'use client';

import { useEffect, useRef, memo } from 'react';
import { gsap } from 'gsap';
import { CIRCLE_CIRCUMFERENCE } from '../constants';

interface ProgressBadgeProps {
  value: number;
  color?: string;
}

/**
 * Badge de progression circulaire avec animation GSAP
 */
const ProgressBadge = memo(function ProgressBadge({ value, color = '#10b981' }: ProgressBadgeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (!circleRef.current) return;
    
    const targetOffset = CIRCLE_CIRCUMFERENCE - (value / 100) * CIRCLE_CIRCUMFERENCE;
    const prevOffset = CIRCLE_CIRCUMFERENCE - (prevValueRef.current / 100) * CIRCLE_CIRCUMFERENCE;
    
    gsap.fromTo(circleRef.current, 
      { strokeDashoffset: prevOffset },
      { strokeDashoffset: targetOffset, duration: 0.8, ease: 'power2.out' }
    );
    
    prevValueRef.current = value;
  }, [value]);

  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      <svg width="36" height="36" className="transform -rotate-90">
        <circle cx="18" cy="18" r="14" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="3" fill="none" />
        <circle
          ref={circleRef}
          cx="18" cy="18" r="14" stroke={color} strokeWidth="3" fill="none"
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={CIRCLE_CIRCUMFERENCE}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">{value}</span>
      </div>
    </div>
  );
});

export default ProgressBadge;

'use client';

import { motion } from 'framer-motion';
import { COLOR_MAP } from '@/lib/data/constants';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function CircularProgress({ 
  value, 
  size = 100, 
  strokeWidth = 8, 
  color = 'violet' 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const colorHex = COLOR_MAP[color] || '#8b5cf6';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-30"
        style={{ background: `radial-gradient(circle, ${colorHex}40, transparent 70%)` }}
      />
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorHex} />
            <stop offset="100%" stopColor={colorHex} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={radius} 
          stroke="rgba(51, 65, 85, 0.3)" 
          strokeWidth={strokeWidth} 
          fill="none" 
        />
        <motion.circle
          cx={size/2} 
          cy={size/2} 
          r={radius}
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
        >
          {value}%
        </motion.span>
      </div>
    </div>
  );
}

interface MiniProgressProps {
  value: number;
  color?: string;
}

export function MiniProgress({ value, color = 'violet' }: MiniProgressProps) {
  const size = 36;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const colorHex = COLOR_MAP[color] || '#8b5cf6';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={radius} 
          stroke="rgba(51, 65, 85, 0.3)" 
          strokeWidth={strokeWidth} 
          fill="none" 
        />
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={radius} 
          stroke={colorHex} 
          strokeWidth={strokeWidth} 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
        />
      </svg>
    </div>
  );
}

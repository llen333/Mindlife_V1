'use client';

import { motion } from 'framer-motion';

const GRADIENTS: Record<string, string> = {
  violet: 'from-violet-500 to-violet-400',
  emerald: 'from-emerald-500 to-emerald-400',
  cyan: 'from-cyan-500 to-cyan-400',
  amber: 'from-amber-500 to-amber-400',
  rose: 'from-rose-500 to-rose-400',
  purple: 'from-purple-500 to-purple-400',
  blue: 'from-blue-500 to-blue-400',
  orange: 'from-orange-500 to-orange-400',
};

interface ProgressBarProps {
  progress: number;
  color?: string;
  className?: string;
  showAnimation?: boolean;
}

export function ProgressBar({ 
  progress, 
  color = 'violet', 
  className = '',
  showAnimation = true 
}: ProgressBarProps) {
  const gradient = GRADIENTS[color] || GRADIENTS.violet;

  return (
    <div className={`relative w-full h-2 bg-white/5 rounded-full overflow-hidden ${className}`}>
      <motion.div
        style={{ width: `${progress}%` }}
        className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
        initial={showAnimation ? { width: 0 } : false}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

// Version simplifiée sans animation (pour les listes)
export function ProgressBarStatic({ 
  progress, 
  color = 'violet',
  className = ''
}: ProgressBarProps) {
  const gradient = GRADIENTS[color] || GRADIENTS.violet;

  return (
    <div className={`relative w-full h-2 bg-white/5 rounded-full overflow-hidden ${className}`}>
      <div
        style={{ width: `${progress}%` }}
        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-300`}
      />
    </div>
  );
}

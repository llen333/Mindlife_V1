'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const GLOW_COLORS: Record<string, string> = {
  violet: 'hover:shadow-violet-500/10',
  emerald: 'hover:shadow-emerald-500/10',
  cyan: 'hover:shadow-cyan-500/10',
  amber: 'hover:shadow-amber-500/10',
  rose: 'hover:shadow-rose-500/10',
  purple: 'hover:shadow-purple-500/10',
  blue: 'hover:shadow-blue-500/10',
  orange: 'hover:shadow-orange-500/10',
};

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hover?: boolean;
  animated?: boolean;
}

export function GlassCard({
  children,
  className = '',
  glowColor = 'violet',
  hover = true,
  animated = false,
}: GlassCardProps) {
  const glowClass = GLOW_COLORS[glowColor] || GLOW_COLORS.violet;

  const baseClasses = cn(
    'relative overflow-hidden',
    'bg-white/[0.03] backdrop-blur-xl',
    'border border-white/[0.08]',
    'rounded-2xl',
    'shadow-xl shadow-black/20',
    'before:absolute before:inset-0',
    'before:bg-gradient-to-b before:from-white/[0.07] before:via-transparent before:to-transparent',
    'before:pointer-events-none',
    hover && `hover:shadow-2xl ${glowClass} hover:border-white/[0.15] hover:scale-[1.005] hover:-translate-y-0.5 transition-transform duration-200 ease-out`,
    className
  );

  if (animated) {
    return (
      <motion.div
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}

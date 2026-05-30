'use client';

import { useEffect, useRef, memo } from 'react';
import { gsap } from 'gsap';
import { Task, Goal, Event } from '@/lib/store/selectors';
import GlassCard from './GlassCard';
import ProgressBadge from './ProgressBadge';
import ActionItem from './ActionItem';
import { COLOR_CLASSES } from '../constants';

export interface CategoryCardAction {
  text: string;
  badge?: string;
  badgeColor?: string;
  isUrgent?: boolean;
  isDone?: boolean;
  type?: 'task' | 'event' | 'goal';
  data?: Task | Event | Goal;
}

export interface CategoryCardProps {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  progress?: number;
  actions: CategoryCardAction[];
  onActionClick?: (action: CategoryCardAction) => void;
}

/**
 * Composant de carte de catégorie avec animation GSAP
 */
const CategoryCard = memo(({ id, label, icon: Icon, color, progress, actions, onActionClick }: CategoryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const c = COLOR_CLASSES[color] || COLOR_CLASSES.slate;

  // Animation d'entrée GSAP
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="flex-shrink-0 w-[200px] h-[220px]"
    >
      <GlassCard glowColor={c.glow} className="p-4 group h-full flex flex-col">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${c.text}`} />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{label}</span>
            </div>
            <ProgressBadge value={progress || 0} color={c.progress} />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {actions.slice(0, 6).map((action, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  if (onActionClick && action.data) {
                    e.stopPropagation();
                    onActionClick(action);
                  }
                }}
                className={action.data ? 'cursor-pointer hover:bg-white/[0.05] rounded-lg -mx-1 px-1 transition-colors' : ''}
              >
                <ActionItem {...action} badgeColor={action.badgeColor || color} />
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;

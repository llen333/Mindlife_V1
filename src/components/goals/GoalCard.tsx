'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Goal, GoalMilestone } from '@/lib/store';
import { MiniProgress } from '@/components/ui/circular-progress';
import { ProgressBar } from '@/components/ui/progress-bar';
import { MiniTimeline } from '@/components/ui/mini-timeline';

// ============================================================================
// TYPES
// ============================================================================

interface Milestone extends GoalMilestone {
  description?: string;
  actualTime?: number;
  actions?: string[];
}

export interface GoalCardProps {
  goal: Goal;
  index: number;
  category: { name: string; color: string };
  priority: { name: string; color: string };
  nextMilestone: Milestone | undefined;
  onClick: () => void;
  getCategoryColor: (categoryId?: string, category?: { color: string }) => string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function GoalCard({
  goal,
  index,
  category,
  priority,
  nextMilestone,
  onClick,
  getCategoryColor,
}: GoalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.03,
        ease: 'easeOut'
      }}
      onClick={onClick}
      className="group cursor-pointer p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-start gap-3">
        <MiniProgress value={goal.progress} color={getCategoryColor(goal.categoryId, goal.category)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white text-sm truncate">{goal.title}</h3>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-${priority.color}-500/20 text-${priority.color}-400`}>
              {priority.name}
            </span>
          </div>
          <ProgressBar progress={goal.progress} color={getCategoryColor(goal.categoryId, goal.category)} />
          
          {/* Mini Timeline */}
          <MiniTimeline start={goal.startDate} end={goal.endDate} progress={goal.progress} />
          
          {/* Prochaine étape */}
          {nextMilestone && (
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <Play className="w-3 h-3" />
              <span className="truncate">{nextMilestone.title}</span>
              {nextMilestone.estimatedTime && (
                <span className="text-violet-400">{formatTime(nextMilestone.estimatedTime)}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

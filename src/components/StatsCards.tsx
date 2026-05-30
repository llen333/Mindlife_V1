'use client';

import { useEffect, useRef, memo } from 'react';
import { gsap } from 'gsap';
import {
  CheckSquare,
  Target,
  Calendar,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  delay?: number;
}

const StatCard = memo(function StatCard({ title, value, subtitle, icon: Icon, gradient, delay = 0 }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay, ease: 'power2.out' }
      );
    }
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="glass-card glass-card-hover p-6 relative overflow-hidden bg-white/5 border border-white/10"
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-20 blur-2xl"
        style={{ background: gradient }}
      />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
          <p className="text-xs text-white/40">{subtitle}</p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: gradient }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
});

function StatsCards() {
  const { tasks, goals, events, habits, translate } = useStore();

  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const activeGoals = goals.filter((g) => g.status === 'active').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((e) => {
    const eventDate = new Date(e.date).toISOString().split('T')[0];
    return eventDate === todayStr;
  }).length;
  const completedHabits = habits.filter((h) => h.completedDates.includes(todayStr)).length;

  const stats = [
    {
      title: translate('pendingTasks'),
      value: pendingTasks,
      subtitle: `${completedTasks} ${translate('completed')}`,
      icon: CheckSquare,
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    },
    {
      title: translate('activeGoals'),
      value: activeGoals,
      subtitle: translate('inProgress'),
      icon: Target,
      gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    },
    {
      title: translate('todayEvents'),
      value: todayEvents,
      subtitle: translate('inCalendar'),
      icon: Calendar,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    },
    {
      title: translate('habits'),
      value: `${completedHabits}/${habits.length}`,
      subtitle: translate('habitsCompleted'),
      icon: Zap,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
}

export default memo(StatsCards);

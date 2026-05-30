'use client';

import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accentColor: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export function SectionHeader({
  id,
  icon: Icon,
  title,
  subtitle,
  accentColor,
  isExpanded,
  onToggle,
}: SectionHeaderProps) {
  return (
    <button
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            `bg-gradient-to-br ${accentColor} shadow-lg`
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <h2 className="text-xl font-black uppercase tracking-tight text-white">{title}</h2>
          <p className="text-sm text-white/40">{subtitle}</p>
        </div>
      </div>
      <div
        ref={el => {
          if (el) gsap.to(el, { rotation: isExpanded ? 180 : 0, duration: 0.3, ease: 'power2.inOut' });
        }}
        style={{ transformOrigin: 'center center' }}
      >
        <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
}

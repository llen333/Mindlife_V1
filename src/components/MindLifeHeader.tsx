'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

// Theme colors mapping
const themeColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  cyan: { bg: 'bg-[#00f2ff]', text: 'text-[#00f2ff]', border: 'border-[#00f2ff]/30', glow: 'shadow-[0_0_25px_rgba(0,242,255,0.4)]' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/30', glow: 'shadow-[0_0_25px_rgba(16,185,129,0.4)]' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500/30', glow: 'shadow-[0_0_25px_rgba(249,115,22,0.4)]' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500/30', glow: 'shadow-[0_0_25px_rgba(139,92,246,0.4)]' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500/30', glow: 'shadow-[0_0_25px_rgba(168,85,247,0.4)]' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/30', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]' },
};

// Subscription vide pour useSyncExternalStore
const emptySubscribe = () => () => {};

// Fonction pour vérifier si on est côté client
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface MindLifeHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  theme?: 'cyan' | 'emerald' | 'orange' | 'violet' | 'purple' | 'amber' | 'rose';
  showBackButton?: boolean;
  hideClock?: boolean;
  rightContent?: React.ReactNode;
  onBackClick?: () => void;
}

export default function MindLifeHeader({
  title,
  subtitle,
  icon: Icon,
  theme = 'cyan',
  showBackButton = true,
  hideClock = false,
  rightContent,
  onBackClick,
}: MindLifeHeaderProps) {
  const { setActivePanel, userProfile } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Utiliser useSyncExternalStore pour détecter le montage client
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  
  const colors = themeColors[theme];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => 
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  const formatDate = (date: Date) => {
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString('fr-FR', { month: 'long' });
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNum} ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      setActivePanel('dashboard');
    }
  };

  return (
    <header className="flex items-center justify-between px-4 lg:px-10 py-4 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5">
      {/* Left Section */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Back Button */}
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:border-white/20 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Retour</span>
          </button>
        )}
        
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center text-[#050505]",
            colors.bg,
            colors.glow
          )}>
            <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div>
            <h1 className="text-lg lg:text-2xl font-black tracking-tight uppercase">{title}</h1>
            {subtitle && (
              <span className={cn("text-[8px] uppercase tracking-[0.3em] font-bold", colors.text, "opacity-60")}>
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-4 lg:gap-8">
        {/* Custom Right Content */}
        {rightContent}
        
        {/* Clock & Date - suppressHydrationWarning pour les données temporelles */}
        {!hideClock && (
          <div className="text-right hidden sm:block">
            <div 
              suppressHydrationWarning
              className={cn(
                "font-black text-lg lg:text-xl tabular-nums",
                colors.text
              )} 
              style={{ textShadow: `0 0 10px currentColor` }}
            >
              {mounted ? formatTime(currentTime) : '--:--:--'}
            </div>
            <div 
              suppressHydrationWarning
              className="text-[10px] text-white/40 uppercase tracking-widest"
            >
              {mounted ? formatDate(currentTime) : 'Chargement...'}
            </div>
          </div>
        )}
        
        {/* User Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white truncate max-w-[120px] lg:max-w-[180px]">
              {userProfile?.name || 'Utilisateur'}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">
              {userProfile?.role === 'admin' ? 'Admin' : 'Membre'}
            </p>
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl border border-white/10 p-1 bg-white/5 overflow-hidden">
            {userProfile?.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt={userProfile.name || 'Avatar'} 
                className="w-full h-full rounded-xl bg-cover bg-center object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                <span className="text-sm font-bold text-white/60">
                  {(userProfile?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useRef, useEffect, memo } from 'react';
import gsap from 'gsap';
import { Construction, Sparkles, Settings, BookOpen, TrendingUp, Heart, Bot, Briefcase, LucideIcon } from 'lucide-react';
import { useStore } from '@/lib/store';
import MindLifeHeader from './MindLifeHeader';

// Mapping des pages aux infos de header
const pageInfoMap: Record<string, { title: string; subtitle: string; icon: LucideIcon; theme: 'cyan' | 'emerald' | 'violet' | 'orange' | 'purple' | 'amber' | 'rose' }> = {
  management: { title: 'Gestion', subtitle: 'Gérez vos projets et ressources', icon: Briefcase, theme: 'amber' },
  culture: { title: 'Culture', subtitle: 'Lectures, films et découvertes culturelles', icon: BookOpen, theme: 'violet' },
  growth: { title: 'Croissance', subtitle: 'Suivez votre développement personnel', icon: TrendingUp, theme: 'emerald' },
  health: { title: 'Santé', subtitle: 'Suivi médical et bien-être', icon: Heart, theme: 'rose' },
  'ai-synthesis': { title: 'Synthèse AI', subtitle: 'Analyses et insights personnalisés', icon: Bot, theme: 'purple' },
};

const PlaceholderPage = memo(function PlaceholderPage() {
  const { activePanel } = useStore();
  
  // Refs pour animations GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const pageInfo = pageInfoMap[activePanel] || { 
    title: 'Page', 
    subtitle: 'En cours de développement', 
    icon: Construction, 
    theme: 'amber' as const 
  };
  const IconComponent = pageInfo.icon;

  // Animations GSAP au montage
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Container fade in
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );

      // Icon animation - en CSS natif pour éviter les animations infinies JS
      // (le bounce est géré par CSS)

      // Title fade in
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.1, ease: 'power2.out' }
      );

      // Card slide up
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.2, ease: 'power2.out' }
      );

      // Progress indicator
      gsap.fromTo(progressRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, delay: 0.4 }
      );
    });

    return () => ctx.revert();
  }, [activePanel]);

  return (
    <div className="min-h-screen bg-[#0a0f1a] pl-[70px]">
      {/* Header Unifié */}
      <MindLifeHeader
        title={pageInfo.title}
        subtitle={pageInfo.subtitle}
        icon={IconComponent}
        theme={pageInfo.theme}
      />

      {/* Main Content */}
      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <div ref={containerRef} className="text-center max-w-md">
          {/* Icon - avec animation CSS native pour le bounce */}
          <div className="mb-6">
            <div 
              ref={iconRef}
              className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10"
              style={{ animation: 'icon-bounce 3s ease-in-out infinite' }}
            >
              <IconComponent className="w-12 h-12 text-white/40" />
            </div>
          </div>

          {/* Title */}
          <h1 ref={titleRef} className="text-3xl font-bold text-white mb-3">
            {pageInfo.title}
          </h1>
          
          {/* Description */}
          <p className="text-slate-400 mb-8">
            {pageInfo.subtitle}
          </p>

          {/* Coming Soon Card */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 p-8"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-violet-500/5" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Construction className="w-6 h-6 text-amber-400" />
                <span className="text-lg font-semibold text-white">En cours de construction</span>
              </div>
              
              <p className="text-slate-400 text-sm mb-6">
                Cette fonctionnalité est en cours de développement. Elle sera bientôt disponible avec des fonctionnalités innovantes.
              </p>

              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Prochainement</span>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
          </div>

          {/* Progress Indicator */}
          <div ref={progressRef} className="mt-8">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Développement en cours...</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animation pour le bounce */}
      <style jsx global>{`
        @keyframes icon-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(5deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-10px) rotate(-5deg); }
        }
      `}</style>
    </div>
  );
});

export default PlaceholderPage;

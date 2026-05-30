'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { CheckCircle2, RefreshCw, ExternalLink, Apple, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useUserProfile } from '@/lib/hooks';
import MindLifeHeader from '../MindLifeHeader';

// Local imports
import { 
  MetricsCards, 
  ProfileCard, 
  DietaryCard, 
  MacrosCard, 
  IMCScaleCard, 
  AIAssistantCard,
  CuisineGallery,
  AIChatModal 
} from './components';
import { useAIChat } from './hooks';
import { 
  goalMapping, 
  DEFAULT_PROFILE, 
  DEFAULT_COMPUTED, 
  getIMCCategory 
} from './constants';

/**
 * Hub Alimentaire - Page principale
 * Affiche les métriques nutritionnelles, le profil et l'assistant IA
 */
export default function HubAlimentairePage() {
  const { setActivePanel, currentUserId } = useStore();
  const { parsedProfile, computed, isLoading, refresh, getIMCCategory: hookGetIMCCategory } = useUserProfile();
  
  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const bmrCardRef = useRef<HTMLDivElement>(null);
  const imcCardRef = useRef<HTMLDivElement>(null);
  const tdeeCardRef = useRef<HTMLDivElement>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const dietaryCardRef = useRef<HTMLDivElement>(null);
  const macrosCardRef = useRef<HTMLDivElement>(null);
  const imcScaleCardRef = useRef<HTMLDivElement>(null);
  const aiCardRef = useRef<HTMLDivElement>(null);
  const cuisineSectionRef = useRef<HTMLElement>(null);
  const cuisineCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // State
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [cuisineCarouselIndex, setCuisineCarouselIndex] = useState(0);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Profile and metrics with defaults
  const profile = parsedProfile || DEFAULT_PROFILE;
  const metrics = computed || DEFAULT_COMPUTED;
  const goalInfo = goalMapping[profile.mainGoal] || goalMapping.maintain;

  // IMC Category
  const getIMCCategorySafe = useCallback((imc: number) => {
    if (hookGetIMCCategory) return hookGetIMCCategory(imc);
    return getIMCCategory(imc);
  }, [hookGetIMCCategory]);
  
  const imcCategory = getIMCCategorySafe(metrics.imc);

  // AI Chat hook
  const aiChat = useAIChat({ profile, metrics, goalInfo });

  // Initial GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = [
        { ref: bmrCardRef, delay: 0.1 },
        { ref: imcCardRef, delay: 0.2 },
        { ref: tdeeCardRef, delay: 0.3 },
        { ref: profileCardRef, delay: 0.4 },
        { ref: dietaryCardRef, delay: 0.5 },
        { ref: macrosCardRef, delay: 0.6 },
        { ref: imcScaleCardRef, delay: 0.7 },
        { ref: aiCardRef, delay: 0.8 },
      ];

      cards.forEach(({ ref, delay }) => {
        if (ref.current) {
          gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay, ease: 'power2.out' });
        }
      });

      if (cuisineSectionRef.current) {
        gsap.fromTo(cuisineSectionRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.9, ease: 'power2.out' });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Toast animation
  useEffect(() => {
    if (showSyncSuccess && toastRef.current) {
      gsap.fromTo(toastRef.current, { opacity: 0, y: -50, xPercent: -50 }, { opacity: 1, y: 0, xPercent: -50, duration: 0.3, ease: 'power2.out' });
    } else if (!showSyncSuccess && toastRef.current) {
      gsap.to(toastRef.current, { opacity: 0, y: -50, xPercent: -50, duration: 0.3, ease: 'power2.in' });
    }
  }, [showSyncSuccess]);

  // Modal animation
  useEffect(() => {
    if (isAIChatOpen) {
      if (modalRef.current) {
        gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      }
      if (modalContentRef.current) {
        gsap.fromTo(modalContentRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
      }
    }
  }, [isAIChatOpen]);

  // Handlers
  const handleSync = async () => {
    await refresh();
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 3000);
  };

  const closeModal = useCallback(() => {
    if (modalRef.current && modalContentRef.current) {
      gsap.to(modalContentRef.current, { scale: 0.9, opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(modalRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => setIsAIChatOpen(false) });
    } else {
      setIsAIChatOpen(false);
    }
  }, []);

  const toggleCuisine = async (cuisineId: string) => {
    const currentCuisines = profile.favoriteCuisines || [];
    const newCuisines = currentCuisines.includes(cuisineId)
      ? currentCuisines.filter((c: string) => c !== cuisineId)
      : [...currentCuisines, cuisineId];
    
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId || 'user-admin', favoriteCuisines: newCuisines })
      });
      refresh();
    } catch (error) {
      console.error('Error updating cuisines:', error);
    }
  };

  const handleCuisineHover = (index: number, isEntering: boolean) => {
    const card = cuisineCardsRef.current[index];
    if (card) {
      gsap.to(card, { scale: isEntering ? 1.02 : 1, duration: 0.2, ease: 'power2.out' });
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#080c0a] via-[#0a1210] to-[#080c0a] pl-[70px] pt-20">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />

      {/* Header */}
      <MindLifeHeader
        title="Hub Alimentaire"
        subtitle={goalInfo.label}
        icon={Utensils}
        theme="emerald"
        rightContent={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePanel('settings')}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm",
                "bg-white/5 border border-emerald-500/30 text-emerald-400",
                "hover:bg-emerald-500/10 hover:border-emerald-500/50"
              )}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Modifier dans Paramètres</span>
            </button>
            <button
              onClick={handleSync}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm",
                "bg-gradient-to-r from-emerald-500 to-emerald-400 text-[#080c0a]",
                "shadow-[0_0_20px_rgba(19,236,164,0.3)]",
                "hover:shadow-[0_0_30px_rgba(19,236,164,0.5)]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              <span>SYNC</span>
            </button>
          </div>
        }
      />

      <div className="relative z-10 p-6 pb-32">
        {/* Sync Success Toast */}
        {showSyncSuccess && (
          <div ref={toastRef} className="fixed top-4 left-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg backdrop-blur-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Données synchronisées avec succès !</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 space-y-6">
            <MetricsCards metrics={metrics} imcCategory={imcCategory} bmrCardRef={bmrCardRef} imcCardRef={imcCardRef} tdeeCardRef={tdeeCardRef} />
            <ProfileCard profile={profile} metrics={metrics} profileCardRef={profileCardRef} />
            <DietaryCard dietaryPreferences={profile.dietaryPreferences} allergies={profile.allergies} dietaryCardRef={dietaryCardRef} />
          </div>

          <div className="space-y-6">
            <MacrosCard metrics={metrics} macrosCardRef={macrosCardRef} />
            <IMCScaleCard imc={metrics.imc} imcCategory={imcCategory} imcScaleCardRef={imcScaleCardRef} />
            <AIAssistantCard aiCardRef={aiCardRef} onOpenChat={() => setIsAIChatOpen(true)} />
          </div>
        </div>

        <CuisineGallery
          favoriteCuisines={profile.favoriteCuisines}
          cuisineCarouselIndex={cuisineCarouselIndex}
          onCarouselChange={setCuisineCarouselIndex}
          onToggleCuisine={toggleCuisine}
          cuisineSectionRef={cuisineSectionRef}
          cuisineCardsRef={cuisineCardsRef}
          onCuisineHover={handleCuisineHover}
        />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-emerald-500/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Apple className="w-4 h-4 text-emerald-500" />
            <span>Mindlife OS v4.2 — Module Nutrition Intelligence</span>
          </div>
          <div className="flex gap-6">
            <span className="text-slate-400">Profil mis à jour: {new Date().toLocaleDateString('fr-FR')}</span>
          </div>
        </footer>
      </div>

      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={isAIChatOpen}
        chatMessages={aiChat.chatMessages}
        chatInput={aiChat.chatInput}
        isAITyping={aiChat.isAITyping}
        modalRef={modalRef}
        modalContentRef={modalContentRef}
        chatMessagesRef={aiChat.chatMessagesRef}
        chatEndRef={aiChat.chatEndRef}
        onClose={closeModal}
        onInputChange={aiChat.setChatInput}
        onSendMessage={aiChat.sendChatMessage}
      />

      {/* Global Styles */}
      <style jsx global>{`
        .glass-card {
          background: rgba(16, 34, 28, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(19, 236, 164, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .glass-card:hover {
          border-color: rgba(19, 236, 164, 0.2);
        }
        .bg-gradient-mesh {
          background-image: 
            radial-gradient(at 0% 0%, rgba(19, 236, 164, 0.08) 0, transparent 50%),
            radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.08) 0, transparent 50%),
            radial-gradient(at 50% 50%, rgba(19, 236, 164, 0.03) 0, transparent 70%);
        }
      `}</style>
    </div>
  );
}

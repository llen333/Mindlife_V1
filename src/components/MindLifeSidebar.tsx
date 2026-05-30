'use client';

import { useState, useRef, useEffect, memo } from 'react';
import gsap from 'gsap';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Target,
  Briefcase,
  Apple,
  ChefHat,
  Brain,
  BookOpen,
  TrendingUp,
  Heart,
  Dumbbell,
  Sparkles,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useNavigation, useNavigationActions, useUserProfile,
  useGlobalActions, useStore
} from '@/lib/store/selectors';

const menuSections = [
  {
    title: 'PRINCIPAL',
    items: [
      { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
      { id: 'calendar', label: 'Calendrier', icon: Calendar },
    ],
  },
  {
    title: 'LOGISTIQUE',
    items: [
      { id: 'tasks', label: 'Tâches', icon: CheckSquare },
      { id: 'goals', label: 'Objectifs', icon: Target },
      { id: 'management', label: 'Gestion', icon: Briefcase, placeholder: true },
    ],
  },
  {
    title: 'ALIMENTATION',
    items: [
      { id: 'hub-alimentaire', label: 'Hub Alimentaire', icon: Apple },
      { id: 'nutrition', label: 'Alimentation', icon: ChefHat },
    ],
  },
  {
    title: 'ESPRIT ET CULTURE',
    items: [
      { id: 'mind', label: 'Esprit', icon: Brain },
      { id: 'culture', label: 'Culture', icon: BookOpen, placeholder: true },
      { id: 'growth', label: 'Croissance', icon: TrendingUp, placeholder: true },
    ],
  },
  {
    title: 'SPORT ET SANTÉ',
    items: [
      { id: 'health', label: 'Santé', icon: Heart, placeholder: true },
      { id: 'sport', label: 'Sport', icon: Dumbbell },
      { id: 'ai-synthesis', label: 'Synthèse AI', icon: Sparkles, placeholder: true },
    ],
  },
];

const MindLifeSidebar = memo(function MindLifeSidebar() {
  const activePanel = useNavigation().activePanel;
  const { setActivePanel } = useNavigationActions();
  const language = useStore(state => state.language);
  const setLanguage = useGlobalActions().setLanguage;
  const userProfile = useUserProfile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'PRINCIPAL',
    'LOGISTIQUE',
    'ALIMENTATION',
    'ESPRIT ET CULTURE',
    'SPORT ET SANTÉ',
  ]);

  const sidebarRef = useRef<HTMLElement>(null);
  const logoTextRef = useRef<HTMLDivElement>(null);
  const userTextRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Animation de la largeur de la sidebar
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isExpanded ? 190 : 70,
        duration: 0.25,
        ease: 'power2.out'
      });
    }
  }, [isExpanded]);

  // Animation du texte du logo
  useEffect(() => {
    if (logoTextRef.current) {
      if (isExpanded) {
        gsap.fromTo(
          logoTextRef.current,
          { opacity: 0, width: 0 },
          { opacity: 1, width: 'auto', duration: 0.2, ease: 'power2.out' }
        );
      } else {
        gsap.to(logoTextRef.current, {
          opacity: 0,
          width: 0,
          duration: 0.15,
          ease: 'power2.in'
        });
      }
    }
  }, [isExpanded]);

  // Animation du texte utilisateur
  useEffect(() => {
    if (userTextRef.current) {
      if (isExpanded) {
        gsap.fromTo(
          userTextRef.current,
          { opacity: 0, width: 0 },
          { opacity: 1, width: 'auto', duration: 0.2, ease: 'power2.out' }
        );
      } else {
        gsap.to(userTextRef.current, {
          opacity: 0,
          width: 0,
          duration: 0.15,
          ease: 'power2.in'
        });
      }
    }
  }, [isExpanded]);

  // Animation du sélecteur de langue
  useEffect(() => {
    if (langRef.current) {
      if (isExpanded) {
        gsap.fromTo(
          langRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: 'power2.out' }
        );
      } else {
        gsap.to(langRef.current, {
          opacity: 0,
          duration: 0.15,
          ease: 'power2.in'
        });
      }
    }
  }, [isExpanded]);

  const toggleSection = (title: string) => {
    if (!isExpanded) return;
    setExpandedSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const handleNavigate = (panelId: string) => {
    setActivePanel(panelId);
  };

  // Fonction pour gérer les effets hover sur les boutons
  const handleButtonHover = (element: HTMLElement | null, isHover: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isHover ? 1.01 : 1,
        duration: 0.15,
        ease: 'power2.out'
      });
    }
  };

  return (
    <aside
      ref={sidebarRef}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#0a0f1a]/95 backdrop-blur-xl z-40 flex flex-col overflow-hidden",
        isExpanded ? "border-r border-white/10 shadow-2xl shadow-black/50" : "border-r border-white/5"
      )}
      style={{ width: 70 }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/5 flex items-center justify-center" style={{ minHeight: '72px' }}>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {isExpanded && (
          <div ref={logoTextRef} className="ml-3 overflow-hidden">
            <h1 className="text-lg font-bold text-white tracking-wide whitespace-nowrap">MINDLIFE</h1>
            <p className="text-[10px] text-emerald-500 font-medium whitespace-nowrap">Gestion Personnelle</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-4">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-2">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.title)}
              className={cn(
                "w-full flex items-center px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors",
                isExpanded ? "justify-between" : "justify-center"
              )}
            >
              {isExpanded ? (
                <>
                  <span>{section.title}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      expandedSections.includes(section.title) ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </>
              ) : (
                <span className="text-[10px]">•</span>
              )}
            </button>
            
            {/* Section Items */}
            {(!isExpanded || expandedSections.includes(section.title)) && (
              <div className="mt-1 px-2 space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                    onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      activePanel === item.id
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                      item.placeholder && 'opacity-70',
                      !isExpanded && 'justify-center'
                    )}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && (
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        {item.label}
                        {item.placeholder && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                            Bientôt
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Language Selector */}
      {isExpanded && (
        <div ref={langRef} className="px-4 py-2 border-t border-white/5">
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <span className="text-lg">{language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
            <span>{language === 'fr' ? 'Français' : 'English'}</span>
          </button>
        </div>
      )}

      {/* Settings */}
      <div className="px-4 py-2 border-t border-white/5">
        <button
          onClick={() => handleNavigate('settings')}
          title={!isExpanded ? 'Paramètres' : undefined}
          onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
          onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
            activePanel === 'settings'
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'text-slate-400 hover:bg-white/5 hover:text-white',
            !isExpanded && 'justify-center'
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span>Paramètres</span>}
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className={cn("flex items-center gap-3", !isExpanded && "justify-center")}>
          <div 
            className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden"
            title={!isExpanded ? userProfile?.name || 'Utilisateur' : undefined}
          >
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <span>{(userProfile?.name || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
          {isExpanded && (
            <div ref={userTextRef} className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{userProfile?.name || 'Utilisateur'}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                PREMIUM
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});

export default MindLifeSidebar;

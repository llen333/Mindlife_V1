'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Calendar,
  FileText,
  Repeat,
  BookOpen,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Globe,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCategories, useNavigation, useNavigationActions,
  usePreferences, useGlobalActions, getCategoryColorClass, useStore
} from '@/lib/store/selectors';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Language } from '@/lib/i18n';

import { languages } from '@/lib/i18n';

export default function Sidebar() {
  const { theme } = usePreferences();
  const { activePanel, sidebarOpen, selectedCategory } = useNavigation();
  const categories = useCategories();
  const { setActivePanel, setSidebarOpen, setSelectedCategory, setIsAssistantOpen } = useNavigationActions();
  const { setTheme, setLanguage, translate } = useGlobalActions();
  const language = useStore(state => state.language);
  
  const collapsed = !sidebarOpen;
  const sidebarRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: 'dashboard', label: translate('dashboard'), icon: LayoutDashboard },
    { id: 'tasks', label: translate('tasks'), icon: CheckSquare },
    { id: 'goals', label: translate('goals'), icon: Target },
    { id: 'calendar', label: translate('calendar'), icon: Calendar },
    { id: 'notes', label: translate('notes'), icon: FileText },
    { id: 'habits', label: translate('habits'), icon: Repeat },
    { id: 'journal', label: translate('journal'), icon: BookOpen },
  ];

  const [showLangMenu, setShowLangMenu] = useState(false);

  // Animation de la largeur de la sidebar
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: collapsed ? 70 : 100,
        duration: 0.25,
        ease: 'power2.out'
      });
    }
  }, [collapsed]);

  // Animation du logo
  useEffect(() => {
    if (logoRef.current) {
      if (!collapsed) {
        gsap.fromTo(
          logoRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' }
        );
      }
    }
  }, [collapsed]);

  const cycleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  // Fonction pour gérer les effets hover sur les boutons
  const handleButtonHover = (element: HTMLElement | null, isHover: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isHover ? 1.02 : 1,
        duration: 0.15,
        ease: 'power2.out'
      });
    }
  };

  const handleButtonTap = (element: HTMLElement | null, isPressed: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isPressed ? 0.98 : 1,
        duration: 0.1,
        ease: 'power2.out'
      });
    }
  };

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 h-screen z-40 bg-slate-900/80 backdrop-blur-xl border-r border-white/10"
      style={{ width: collapsed ? 70 : 100 }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!collapsed && (
            <div ref={logoRef} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg gradient-text">LifeFlow</h1>
                <p className="text-xs text-white/40">{translate('personalLifeManagement')}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 text-white/60 hover:text-white hover:bg-white/10"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 custom-scrollbar">
          {/* Main Navigation */}
          <div className="p-3">
            {!collapsed && (
              <p className="text-xs text-white/40 px-3 mb-2 uppercase tracking-wider">
                Navigation
              </p>
            )}
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePanel(item.id)}
                  onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                  onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                  onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
                  onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    activePanel === item.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                      : 'hover:bg-white/5 text-white/70 hover:text-white'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 shrink-0', activePanel === item.id && 'text-purple-400')} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div className="p-3">
            {!collapsed && (
              <p className="text-xs text-white/40 px-3 mb-2 uppercase tracking-wider">
                {translate('categories')}
              </p>
            )}
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                  onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                  onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
                  onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    selectedCategory === category.id
                      ? 'bg-white/10 border border-white/20'
                      : 'hover:bg-white/5'
                  )}
                >
                  <div
                    className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-lg', getCategoryColorClass(category.color))}
                  >
                    {category.icon}
                  </div>
                  {!collapsed && (
                    <span className="font-medium text-sm text-white/80">{category.name}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {/* AI Assistant Button */}
          <button
            onClick={() => setIsAssistantOpen(true)}
            onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
            onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
            onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all border border-purple-500/30"
          >
            <MessageCircle className="w-5 h-5 text-purple-400 shrink-0" />
            {!collapsed && <span className="font-medium text-sm text-white">{translate('assistant')}</span>}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={cycleLanguage}
              onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
              onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
              onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
              onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            >
              <Globe className="w-5 h-5 shrink-0 text-cyan-400" />
              {!collapsed && (
                <span className="font-medium text-sm text-white/70">
                  {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}
                </span>
              )}
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
            onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
            onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 shrink-0 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 shrink-0 text-purple-400" />
            )}
            {!collapsed && <span className="font-medium text-sm text-white/70">{translate('theme')}</span>}
          </button>

          {/* Settings */}
          <button
            onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
            onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
            onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            <Settings className="w-5 h-5 shrink-0 text-white/60" />
            {!collapsed && <span className="font-medium text-sm text-white/70">{translate('settings')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

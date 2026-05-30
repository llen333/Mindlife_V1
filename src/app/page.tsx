'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MindLifeSidebar from '@/components/MindLifeSidebar';
import MindLifeDashboard from '@/components/dashboard/MindLifeDashboard';
import CalendarPage from '@/components/calendar/CalendarPage';
import SleepPage from '@/components/SleepPage';
import SportPage from '@/components/SportPage';
import NutritionPage from '@/components/NutritionPage';
import TasksPanel from '@/components/goals/TasksPanel';
import GoalsPage from '@/components/goals/GoalsPage';
import NotesPanel from '@/components/NotesPanel';
import HabitsPanel from '@/components/HabitsPanel';
import JournalPanel from '@/components/JournalPanel';
import SettingsPage from '@/components/SettingsPage';
import AssistantChat from '@/components/AssistantChat';
import HubAlimentairePage from '@/components/HubAlimentairePage';
import PlaceholderPage from '@/components/PlaceholderPage';
import SpiritPage from '@/components/SpiritPage';
import ManagementPage from '@/components/management/ManagementPage';
import GrowthPage from '@/components/growth/GrowthPage';
import { useStore } from '@/lib/stores';
import { useUsers, useUserProfile } from '@/lib/hooks';

const panelComponents: Record<string, React.ComponentType> = {
  // Principal
  dashboard: MindLifeDashboard,
  calendar: CalendarPage,
  
  // Logistique
  tasks: TasksPanel,
  goals: GoalsPage,
  management: ManagementPage,
  
  // Alimentation
  'hub-alimentaire': HubAlimentairePage,
  nutrition: NutritionPage,
  
  // Esprit et Culture
  mind: SpiritPage,
  culture: PlaceholderPage,
  growth: GrowthPage,
  
  // Sport et Santé
  health: PlaceholderPage,
  sport: SportPage,
  'ai-synthesis': PlaceholderPage,
  
  // Other
  sleep: SleepPage,
  settings: SettingsPage,
};

// Animation variants pour Framer Motion
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const pageTransition: any = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.25
};

export default function Home() {
  const { 
    activePanel, 
    users: zustandUsers, 
    setUsers, 
    dataLoaded, 
    loadAllData,
    currentUserId,
    userProfile,
    isLoading,
  } = useStore();
  
  // Track the last loaded user ID to detect changes
  const lastLoadedUserId = useRef<string | null>(null);
  const prevPanelRef = useRef<string>(activePanel);
  
  // React Query: Charger les utilisateurs
  const { data: users = [] } = useUsers();
  
  // Hook dédié pour synchroniser le profil utilisateur avec Zustand
  useUserProfile();

  // 🔴 CHARGER LES DONNÉES DEPUIS LA DB AU DÉMARRAGE
  useEffect(() => {
    if (!dataLoaded) {
      console.log('📊 Chargement des données depuis la DB...');
      loadAllData();
    }
  }, [dataLoaded, loadAllData]);

  // Synchroniser les utilisateurs React Query avec Zustand (avec deep comparison)
  useEffect(() => {
    if (users.length > 0) {
      // Comparer les IDs au lieu des références d'objets
      const zustandIds = zustandUsers.map(u => u.id).sort().join(',');
      const queryIds = users.map(u => u.id).sort().join(',');
      
      if (zustandIds !== queryIds) {
        setUsers(users.map(u => ({
          id: u.id,
          name: u.name,
          avatar: u.avatar,
        })));
      }
    }
  }, [users, zustandUsers, setUsers]);

  // Log pour debug
  useEffect(() => {
    if (currentUserId !== lastLoadedUserId.current) {
      console.log('🔄 User changed from', lastLoadedUserId.current, 'to', currentUserId);
      lastLoadedUserId.current = currentUserId;
    }
  }, [currentUserId]);
  
  const PanelComponent = panelComponents[activePanel] || MindLifeDashboard;

  // Pages sanctuaires sans sidebar
  const noSidebarPages = ['mind', 'sport'];
  const showSidebar = !noSidebarPages.includes(activePanel);

  // Debug du profil actuel
  useEffect(() => {
    console.log('👤 Current profile:', userProfile?.name, '| currentUserId:', currentUserId, '| isLoading:', isLoading);
  }, [userProfile?.name, currentUserId, isLoading]);

  // Mémoriser la clé pour AnimatePresence
  const panelKey = activePanel;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Sidebar - seulement sur les pages normales */}
      {showSidebar && <MindLifeSidebar />}

      {/* Main Panel avec Framer Motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={panelKey}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="w-full"
        >
          <PanelComponent />
        </motion.div>
      </AnimatePresence>

      {/* Floating Components */}
      <AssistantChat />
    </div>
  );
}

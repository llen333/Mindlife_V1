'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
import HubAlimentairePage from '@/components/HubAlimentairePage';
import PlaceholderPage from '@/components/PlaceholderPage';
import SpiritPage from '@/components/SpiritPage';
import ManagementPage from '@/components/management/ManagementPage';
import GrowthPage from '@/components/growth/GrowthPage';
import KernelDashboard from '@/components/kernel/KernelDashboard';
import ModuleStorePage from '@/components/kernel/ModuleStore';

const panelComponents: Record<string, React.ComponentType> = {
  dashboard: MindLifeDashboard,
  calendar: CalendarPage,
  tasks: TasksPanel,
  goals: GoalsPage,
  management: ManagementPage,
  'hub-alimentaire': HubAlimentairePage,
  nutrition: NutritionPage,
  mind: SpiritPage,
  culture: PlaceholderPage,
  growth: GrowthPage,
  health: PlaceholderPage,
  sport: SportPage,
  'ai-synthesis': PlaceholderPage,
  kernel: KernelDashboard,
  store: ModuleStorePage,
  sleep: SleepPage,
  settings: SettingsPage,
};

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function OsContent({ activePanel }: { activePanel: string }) {
  const Panel = panelComponents[activePanel] || MindLifeDashboard;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePanel}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
      >
        <Panel />
      </motion.div>
    </AnimatePresence>
  );
}

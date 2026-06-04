import {
  LayoutDashboard, Calendar, CheckSquare, Target, Briefcase,
  Apple, ChefHat, Brain, BookOpen, TrendingUp, Heart, Dumbbell, Sparkles,
  Cpu, Package, Moon, Settings,
} from 'lucide-react';
import { registerPanel } from './ui-registry';
import MindLifeDashboard from '@/components/dashboard/MindLifeDashboard';
import CalendarPage from '@/components/calendar/CalendarPage';
import TasksPanel from '@/components/goals/TasksPanel';
import GoalsPage from '@/components/goals/GoalsPage';
import ManagementPage from '@/components/management/ManagementPage';
import HubAlimentairePage from '@/components/HubAlimentairePage';
import NutritionPage from '@/components/NutritionPage';
import SpiritPage from '@/components/SpiritPage';
import PlaceholderPage from '@/components/PlaceholderPage';
import GrowthPage from '@/components/growth/GrowthPage';
import SportPage from '@/components/SportPage';
import KernelDashboard from '@/components/kernel/KernelDashboard';
import ModuleStorePage from '@/components/kernel/ModuleStore';
import SleepPage from '@/components/SleepPage';
import SettingsPage from '@/components/SettingsPage';

registerPanel({ id: 'kernel', label: 'Kernel', icon: Cpu, component: KernelDashboard, section: 'KERNEL' });
registerPanel({ id: 'store', label: 'Module Store', icon: Package, component: ModuleStorePage, section: 'KERNEL' });
registerPanel({ id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, component: MindLifeDashboard, section: 'PRINCIPAL' });
registerPanel({ id: 'calendar', label: 'Calendrier', icon: Calendar, component: CalendarPage, section: 'PRINCIPAL' });
registerPanel({ id: 'tasks', label: 'Tâches', icon: CheckSquare, component: TasksPanel, section: 'LOGISTIQUE' });
registerPanel({ id: 'goals', label: 'Objectifs', icon: Target, component: GoalsPage, section: 'LOGISTIQUE' });
registerPanel({ id: 'management', label: 'Gestion', icon: Briefcase, component: ManagementPage, section: 'LOGISTIQUE', placeholder: true });
registerPanel({ id: 'hub-alimentaire', label: 'Hub Alimentaire', icon: Apple, component: HubAlimentairePage, section: 'ALIMENTATION' });
registerPanel({ id: 'nutrition', label: 'Alimentation', icon: ChefHat, component: NutritionPage, section: 'ALIMENTATION' });
registerPanel({ id: 'mind', label: 'Esprit', icon: Brain, component: SpiritPage, section: 'ESPRIT ET CULTURE' });
registerPanel({ id: 'culture', label: 'Culture', icon: BookOpen, component: PlaceholderPage, section: 'ESPRIT ET CULTURE', placeholder: true });
registerPanel({ id: 'growth', label: 'Croissance', icon: TrendingUp, component: GrowthPage, section: 'ESPRIT ET CULTURE', placeholder: true });
registerPanel({ id: 'health', label: 'Santé', icon: Heart, component: PlaceholderPage, section: 'SPORT ET SANTÉ', placeholder: true });
registerPanel({ id: 'sport', label: 'Sport', icon: Dumbbell, component: SportPage, section: 'SPORT ET SANTÉ' });
registerPanel({ id: 'ai-synthesis', label: 'Synthèse AI', icon: Sparkles, component: PlaceholderPage, section: 'SPORT ET SANTÉ', placeholder: true });
registerPanel({ id: 'sleep', label: 'Sommeil', icon: Moon, component: SleepPage, section: 'AUTRE' });
registerPanel({ id: 'settings', label: 'Paramètres', icon: Settings, component: SettingsPage, section: 'AUTRE' });

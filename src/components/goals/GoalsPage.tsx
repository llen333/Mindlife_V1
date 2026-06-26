'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Flame,
  X,
  Edit3,
  Trash2,
  Play,
  Pause,
  Heart,
  CheckSquare,
  Repeat,
  CalendarDays,
  Sunrise,
  Sunset,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useStore, Goal, GoalMilestone, Task, Event } from '@/lib/store';
import MindLifeHeader from '../MindLifeHeader';
import { CircularProgress } from '@/components/ui/circular-progress';
import { ProgressBar } from '@/components/ui/progress-bar';
import { GlassCard } from '@/components/ui/glass-card';
import { MiniTimeline } from '@/components/ui/mini-timeline';
import GoalCard from './GoalCard';
import GoalModal from './GoalModal';
import TaskModal from './TaskModal';
import CreateEventModal from '../calendar/CreateEventModal';
import { useTimer, TimerDisplay } from './Timer';
import {
  GOAL_CATEGORIES,
  GOAL_PRIORITIES,
  TIME_PERIODS,
  getCategoryColor,
  getCategoryBadge,
  getPriorityBadge,
} from '@/lib/data/constants';
import { 
  calculateMilestoneDates, 
  syncMilestonesWithCalendar 
} from '@/lib/services/milestoneCalendarService';

// ============================================================================
// TYPES LOCAUX (étendus pour l'affichage)
// ============================================================================

interface Milestone extends GoalMilestone {
  description?: string;
  actualTime?: number;
  actions?: string[];
}

interface GoalWithExtras extends Goal {
  estimatedTotalTime?: number;
  actualTotalTime?: number;
}

interface TaskDisplay {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  category?: {
    name: string;
    color: string;
  };
}

// ============================================================================
// CONSTANTES LOCALES
// ============================================================================

// Format time helper
const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function GoalsPage() {
  const { currentUserId, habits, goals: storeGoals, tasks: storeTasks, events: storeEvents, categories, dataLoaded, isLoading, addGoal, updateGoal, deleteGoal, loadEvents, updateTask, addEvent, updateEvent } = useStore();
  // Utiliser les données du store directement
  const goals = storeGoals as Goal[];
  const tasks = storeTasks as Task[];
  const events = storeEvents as Event[];
  const loading = isLoading || !dataLoaded;
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editGoalForm, setEditGoalForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: '',
    startDate: '',
    endDate: '',
    targetValue: '',
    unit: '',
    milestones: [] as Milestone[],
    numberOfSteps: 5,
    defaultTime: '09:00',
    syncWithCalendar: true,
  });

  // Modales Tâches et Rendez-vous
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  // Filtres
  const [activePeriod, setActivePeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Timer hook
  const {
    timerActive,
    timerPaused,
    timerSeconds,
    timerTarget,
    timerGoal,
    timerMilestone,
    startTimer,
    togglePauseTimer,
    stopTimer,
  } = useTimer();

  // Nouvel objectif
  const [newGoalForm, setNewGoalForm] = useState({
    title: '',
    description: '',
    categoryId: 'cat-personal', // Aligné avec les catégories du seed
    priority: 'a_planifier',
    targetValue: '',
    unit: '',
    startDate: new Date().toISOString().split('T')[0], // Date de début = aujourd'hui par défaut
    endDate: '',
    generateMilestones: true, // IA génère les étapes
    milestones: [] as Milestone[], // Étapes éditables
    numberOfSteps: 5, // Nombre d'étapes souhaité
    defaultTime: '09:00', // Heure par défaut pour les événements calendrier
    syncWithCalendar: true, // Synchroniser avec le calendrier
  });

  const userId = currentUserId || 'mindlife-user';

  // ============================================================================
  // FILTERS
  // ============================================================================

  // Helper pour normaliser une date à minuit en heure locale
  const normalizeDate = (dateStr: string | Date | null | undefined): Date | null => {
    if (!dateStr) return null;
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const filteredGoals = goals.filter(goal => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Normaliser les dates pour éviter les problèmes de timezone
    const startDate = normalizeDate(goal.startDate);
    const endDate = normalizeDate(goal.endDate);

    // Si pas de filtre de période, on affiche tout (sauf les terminés)
    if (activePeriod === 'all') {
      return goal.status !== 'completed';
    }

    // Les objectifs terminés n'apparaissent jamais dans les vues filtrées
    if (goal.status === 'completed') return false;

    // NOUVELLE LOGIQUE: Filtrer par DEADLINE (endDate)
    // Un objectif apparaît dans une vue si sa DEADLINE est dans cette période
    // Si pas de deadline, l'objectif n'apparaît que dans "Tout"

    if (!endDate) {
      // Objectif sans deadline: n'apparaît que si startDate est dans la période
      if (!startDate) return false;

      switch (activePeriod) {
        case 'day':
          return startDate.getTime() === today.getTime();
        case 'week': {
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return startDate >= weekStart && startDate <= weekEnd;
        }
        case 'month': {
          return startDate.getMonth() === today.getMonth() && startDate.getFullYear() === today.getFullYear();
        }
        case 'quarter': {
          const quarter = Math.floor(today.getMonth() / 3);
          const goalQuarter = Math.floor(startDate.getMonth() / 3);
          return goalQuarter === quarter && startDate.getFullYear() === today.getFullYear();
        }
        case 'semester': {
          const semester = today.getMonth() < 6 ? 0 : 1;
          const goalSemester = startDate.getMonth() < 6 ? 0 : 1;
          return goalSemester === semester && startDate.getFullYear() === today.getFullYear();
        }
        case 'year':
          return startDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    }

    // Objectif AVEC deadline: filtrer par deadline dans la période
    // Vérifier que l'objectif a commencé (startDate <= aujourd'hui ou pas de startDate)
    if (startDate && startDate > today) {
      return false; // Objectif pas encore commencé
    }

    switch (activePeriod) {
      case 'day':
        // Vue JOUR: Deadline aujourd'hui
        return endDate.getTime() === today.getTime();

      case 'week': {
        // Vue SEMAINE: Deadline cette semaine (lundi-dimanche)
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lundi
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Dimanche
        return endDate >= weekStart && endDate <= weekEnd;
      }

      case 'month':
        // Vue MOIS: Deadline ce mois
        return endDate.getMonth() === today.getMonth() &&
               endDate.getFullYear() === today.getFullYear();

      case 'quarter': {
        // Vue TRIMESTRE: Deadline ce trimestre
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const deadlineQuarter = Math.floor(endDate.getMonth() / 3);
        return deadlineQuarter === currentQuarter &&
               endDate.getFullYear() === today.getFullYear();
      }

      case 'semester': {
        // Vue SEMESTRE: Deadline ce semestre
        const currentSemester = today.getMonth() < 6 ? 0 : 1;
        const deadlineSemester = endDate.getMonth() < 6 ? 0 : 1;
        return deadlineSemester === currentSemester &&
               endDate.getFullYear() === today.getFullYear();
      }

      case 'year':
        // Vue ANNÉE: Deadline cette année
        return endDate.getFullYear() === today.getFullYear();

      default:
        return true;
    }
  }).filter(goal => {
    // Filtres additionnels (priorité, catégorie, recherche)
    if (priorityFilter !== 'all' && goal.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && goal.categoryId !== categoryFilter) return false;
    if (searchQuery && !goal.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // ============================================================================
  // STATS
  // ============================================================================

  const today = new Date().toISOString().split('T')[0];
  const stats = {
    totalGoals: filteredGoals.length,
    inProgress: filteredGoals.filter(g => g.status === 'active').length,
    completed: filteredGoals.filter(g => g.status === 'completed').length,
    averageProgress: filteredGoals.length > 0
      ? Math.round(filteredGoals.reduce((acc, g) => acc + g.progress, 0) / filteredGoals.length)
      : 0,
    streak: 14,
    todayTasks: tasks.filter(t => t.status !== 'completed').length,
    todayEvents: events.filter(e => (e.date || (e.startAt ? e.startAt.split('T')[0] : '')) === today).length,
  };

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  // Génération de milestones locale (sans SDK externe)
  const generateMilestonesLocally = (title: string, categoryId: string, numberOfSteps?: number): Milestone[] => {
    const patterns: Record<string, { title: string; estimatedTime: number; actions?: string[] }[]> = {
      'cat-education': [
        { title: 'Recherche et documentation', estimatedTime: 30, actions: ['Lire la documentation', 'Visionner des tutoriels'] },
        { title: 'Apprentissage des bases', estimatedTime: 60, actions: ['Pratiquer les exemples', 'Prendre des notes'] },
        { title: 'Pratique guidée', estimatedTime: 90, actions: ['Suivre un tutoriel complet', 'Expérimenter'] },
        { title: 'Projet pratique', estimatedTime: 120, actions: ['Créer un mini-projet', 'Appliquer les connaissances'] },
        { title: 'Révision et consolidation', estimatedTime: 45, actions: ['Revoir les concepts', 'Documenter l\'apprentissage'] },
      ],
      'cat-sport': [
        { title: 'Évaluation initiale', estimatedTime: 20, actions: ['Définir les objectifs', 'Mesurer les capacités actuelles'] },
        { title: 'Planification du programme', estimatedTime: 15, actions: ['Créer un planning', 'Définir les exercices'] },
        { title: 'Phase d\'adaptation', estimatedTime: 60, actions: ['Séances légères', 'Habituer le corps'] },
        { title: 'Progression', estimatedTime: 90, actions: ['Augmenter l\'intensité', 'Suivre le programme'] },
        { title: 'Maintien et amélioration', estimatedTime: 60, actions: ['Évaluer les progrès', 'Ajuster si besoin'] },
      ],
      'cat-finance': [
        { title: 'Analyse de la situation', estimatedTime: 30, actions: ['Faire le point', 'Identifier les besoins'] },
        { title: 'Définition des objectifs', estimatedTime: 20, actions: ['Fixer des montants', 'Définir des délais'] },
        { title: 'Plan d\'action', estimatedTime: 45, actions: ['Créer un budget', 'Identifier les économies'] },
        { title: 'Mise en place', estimatedTime: 60, actions: ['Automatiser les économies', 'Suivre les dépenses'] },
        { title: 'Suivi et ajustement', estimatedTime: 30, actions: ['Revue mensuelle', 'Ajuster le plan'] },
      ],
      'cat-personal': [
        { title: 'Réflexion et définition', estimatedTime: 20, actions: ['Clarifier l\'objectif', 'Identifier les motivations'] },
        { title: 'Planification', estimatedTime: 30, actions: ['Définir les étapes', 'Fixer des échéances'] },
        { title: 'Premiers pas', estimatedTime: 45, actions: ['Commencer', 'Créer l\'habitude'] },
        { title: 'Approfondissement', estimatedTime: 60, actions: ['Consolider', 'Élargir'] },
        { title: 'Bilan et célébration', estimatedTime: 15, actions: ['Évaluer', 'Célébrer la réussite'] },
      ],
      'cat-spirituality': [
        { title: 'Découverte et intention', estimatedTime: 15, actions: ['Lire sur le sujet', 'Définir son intention'] },
        { title: 'Pratique initiale', estimatedTime: 20, actions: ['Premiers exercices', 'Créer un rituel'] },
        { title: 'Approfondissement', estimatedTime: 30, actions: ['Pratique régulière', 'Explorer des techniques'] },
        { title: 'Intégration quotidienne', estimatedTime: 45, actions: ['Ancrer l\'habitude', 'Observer les effets'] },
        { title: 'Partage et transmission', estimatedTime: 20, actions: ['Partager son expérience', 'Enseigner si approprié'] },
      ],
      'cat-health': [
        { title: 'État des lieux', estimatedTime: 20, actions: ['Analyser ses habitudes', 'Identifier les changements'] },
        { title: 'Planification', estimatedTime: 30, actions: ['Créer un plan', 'Définir les objectifs'] },
        { title: 'Mise en place progressive', estimatedTime: 45, actions: ['Appliquer', 'Suivre le plan'] },
        { title: 'Adaptation et ajustement', estimatedTime: 30, actions: ['Évaluer', 'Ajuster si besoin'] },
        { title: 'Maintien sur le long terme', estimatedTime: 20, actions: ['Consolider', 'Prévenir les rechutes'] },
      ],
      'cat-social': [
        { title: 'Réflexion sur les relations', estimatedTime: 15, actions: ['Identifier les relations importantes', 'Définir les attentes'] },
        { title: 'Prise de contact', estimatedTime: 20, actions: ['Appeler', 'Proposer une rencontre'] },
        { title: 'Approfondissement', estimatedTime: 45, actions: ['Passer du temps ensemble', 'Écouter activement'] },
        { title: 'Consolidation', estimatedTime: 30, actions: ['Régularité', 'Créer des moments'] },
        { title: 'Célébration de la relation', estimatedTime: 15, actions: ['Exprimer sa gratitude', 'Marquer le coup'] },
      ],
      'cat-professional': [
        { title: 'Analyse des besoins', estimatedTime: 20, actions: ['Identifier les objectifs pro', 'Évaluer les ressources'] },
        { title: 'Planification', estimatedTime: 30, actions: ['Créer un plan', 'Définir les étapes'] },
        { title: 'Mise en œuvre', estimatedTime: 60, actions: ['Exécuter le plan', 'Documenter les progrès'] },
        { title: 'Suivi', estimatedTime: 45, actions: ['Évaluer les résultats', 'Ajuster si besoin'] },
        { title: 'Bilan', estimatedTime: 15, actions: ['Faire le point', 'Planifier la suite'] },
      ],
    };

    const categoryPatterns = patterns[categoryId] || patterns['cat-personal'];
    const stepsCount = numberOfSteps || 5;
    
    // Adapter le nombre d'étapes
    let selectedPatterns = categoryPatterns;
    if (stepsCount < categoryPatterns.length) {
      // Prendre les premières étapes
      selectedPatterns = categoryPatterns.slice(0, stepsCount);
    } else if (stepsCount > categoryPatterns.length) {
      // Ajouter des étapes génériques
      const extraSteps = stepsCount - categoryPatterns.length;
      for (let i = 0; i < extraSteps; i++) {
        selectedPatterns = [
          ...selectedPatterns,
          { 
            title: `Étape ${categoryPatterns.length + i + 1}`, 
            estimatedTime: 45, 
            actions: ['À définir'] 
          }
        ];
      }
    }

    return selectedPatterns.map((pattern, index) => ({
      id: `milestone-${Date.now()}-${index}`,
      title: pattern.title,
      completed: false,
      estimatedTime: pattern.estimatedTime,
      order: index,
      actions: pattern.actions,
    }));
  };

  // 🔥 Fonction pour redistribuer les dates des milestones
  const redistributeMilestoneDates = (milestones: Milestone[], startDate: string, endDate: string): Milestone[] => {
    if (!startDate || !endDate || milestones.length === 0) return milestones;
    
    const dates = calculateMilestoneDates(startDate, endDate, milestones.length);
    return milestones.map((m, index) => ({
      ...m,
      dueDate: dates[index] || startDate,
      order: index,
    }));
  };

  const handleCreateGoal = async (goalData?: Partial<Goal>) => {
    // Si appelé depuis GoalModal, utiliser les données fournies
    const formData = goalData || {
      title: newGoalForm.title,
      description: newGoalForm.description,
      categoryId: newGoalForm.categoryId,
      priority: newGoalForm.priority,
      startDate: newGoalForm.startDate,
      endDate: newGoalForm.endDate,
      targetValue: newGoalForm.targetValue ? parseFloat(newGoalForm.targetValue) : undefined,
      unit: newGoalForm.unit,
      milestones: newGoalForm.milestones,
    };

    if (!formData.title) return;

    // Validation: endDate est obligatoire
    if (!formData.endDate) {
      alert('La date limite est obligatoire');
      return;
    }

    // Validation: endDate >= startDate
    const startDate = new Date(formData.startDate || new Date());
    const endDate = new Date(formData.endDate);
    if (endDate < startDate) {
      alert('La date limite doit être supérieure ou égale à la date de début');
      return;
    }

    try {
      // Créer l'objet goal
      const newGoal = {
        id: `goal-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId || 'cat-personal',
        priority: formData.priority || 'a_planifier',
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || undefined,
        targetValue: formData.targetValue,
        unit: formData.unit || undefined,
        milestones: formData.milestones || [],
        status: 'active' as const,
        progress: 0,
        currentValue: 0,
        completedMilestones: 0,
        totalMilestones: formData.milestones?.length || 0,
        milestonesProgress: 0,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Utiliser le store pour ajouter le goal (sync avec DB)
      await addGoal(newGoal as Goal);

      setShowNewGoalModal(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  // Handler pour sauvegarder une tâche
  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (taskData.id) {
        // Mise à jour
        await updateTask(taskData.id, taskData);
      }
      setShowTaskModal(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  // Handler pour sauvegarder un événement
  const handleSaveEvent = async (eventData: Partial<Event> & { createTask?: boolean }) => {
    try {
      if (selectedEvent?.id) {
        // Mise à jour
        await updateEvent(selectedEvent.id, eventData);
      }
      setShowEventModal(false);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneIndex: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = (goal.milestones || []).map((m, i) =>
      i === milestoneIndex ? { ...m, completed: !m.completed } : m
    );

    // Calculer le nouveau progrès
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const totalCount = updatedMilestones.length;
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    try {
      await updateGoal(goalId, {
        milestones: updatedMilestones,
        progress: newProgress,
      } as any);

      if (selectedGoal?.id === goalId) {
        setSelectedGoal({
          ...goal,
          milestones: updatedMilestones,
          progress: newProgress,
        } as any);
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Es-tu sûr de vouloir supprimer cet objectif ?')) return;

    try {
      await deleteGoal(goalId);
      setSelectedGoal(null);
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  // Commencer l'édition d'un objectif
  const startEditingGoal = (goal: Goal) => {
    setEditGoalForm({
      title: goal.title,
      description: goal.description || '',
      categoryId: goal.categoryId || 'cat-personal',
      priority: goal.priority || 'a_planifier',
      startDate: goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '',
      endDate: goal.endDate ? new Date(goal.endDate).toISOString().split('T')[0] : '',
      targetValue: goal.targetValue?.toString() || '',
      unit: goal.unit || '',
      milestones: (goal.milestones || []) as Milestone[],
      numberOfSteps: (goal.milestones || []).length || 5,
      defaultTime: '09:00',
      syncWithCalendar: true,
    });
    setIsEditingGoal(true);
  };

  // Sauvegarder les modifications d'un objectif
  const handleSaveGoalEdit = async () => {
    if (!selectedGoal) return;

    try {
      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedGoal.id,
          title: editGoalForm.title,
          description: editGoalForm.description,
          categoryId: editGoalForm.categoryId,
          priority: editGoalForm.priority,
          startDate: editGoalForm.startDate,
          endDate: editGoalForm.endDate,
          targetValue: editGoalForm.targetValue ? parseFloat(editGoalForm.targetValue) : undefined,
          unit: editGoalForm.unit || undefined,
          milestones: editGoalForm.milestones,
          userId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updateGoal(data.goal.id, data.goal);
        setSelectedGoal(data.goal);
        setIsEditingGoal(false);

        // Synchroniser les milestones avec le calendrier si demandé
        if (editGoalForm.syncWithCalendar && editGoalForm.milestones.length > 0 && editGoalForm.startDate && editGoalForm.endDate) {
          const category = GOAL_CATEGORIES.find(c => c.id === editGoalForm.categoryId);
          await syncMilestonesWithCalendar(
            selectedGoal.id,
            editGoalForm.title,
            editGoalForm.milestones,
            editGoalForm.startDate,
            editGoalForm.endDate,
            editGoalForm.defaultTime,
            userId,
            editGoalForm.categoryId,
            category?.color || 'violet'
          );
          
          // Recharger les événements depuis la DB
          await loadEvents();
        }
      } else {
        console.error('Failed to update goal');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getNextMilestone = (goal: Goal): Milestone | undefined => {
    const milestones = goal.milestones || [];
    return milestones.find(m => !m.completed);
  };

  // ============================================================================
  // FRAMER MOTION ANIMATION VARIANTS
  // ============================================================================

  // Entrance animations
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  const fadeInDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  // Modal animations
  const modalOverlay = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: [0.55, 0.055, 0.675, 0.19] } }
  };

  const modalContent = {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } },
    exit: { scale: 0.95, opacity: 0, y: 20, transition: { duration: 0.2, ease: [0.55, 0.055, 0.675, 0.19] } }
  };

  // Simple close functions for modals
  const closeNewGoalModal = () => setShowNewGoalModal(false);
  const closeGoalDetailModal = () => { setSelectedGoal(null); setIsEditingGoal(false); };
  const closeTaskModal = () => setShowTaskModal(false);
  const closeEventModal = () => setShowEventModal(false);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />

      {/* Header */}
      <MindLifeHeader
        title="Objectifs"
        subtitle="Créez une meilleure version de vous-même"
        icon={Target}
        theme="violet"
        rightContent={
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
                       bg-gradient-to-r from-violet-500 to-purple-500 text-white
                       shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30
                       transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvel Objectif</span>
          </button>
        }
      />

      <main className="p-6 space-y-4">
        {/* ========== BARRE DE FILTRES - UNE SEULE LIGNE ========== */}
        <motion.div
          {...fadeInDown as any}
          className="flex flex-wrap items-center gap-3"
        >
          {/* Périodes */}
          <div className="flex items-center gap-1 bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl p-1">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.id}
                onClick={() => setActivePeriod(period.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activePeriod === period.id
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>

          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Filtres */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50"
          >
            <option value="all">Toutes priorités</option>
            {GOAL_PRIORITIES.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50"
          >
            <option value="all">Toutes catégories</option>
            {GOAL_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stats rapides */}
          <div className="flex items-center gap-4 ml-auto text-xs">
            <span className="text-slate-400">
              <span className="text-violet-400 font-bold">{stats.inProgress}</span> actifs
            </span>
            <span className="text-slate-400">
              <span className="text-emerald-400 font-bold">{stats.averageProgress}%</span> progrès
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex gap-6">
            {/* ========== COLONNE PRINCIPALE - 3 CARDS ========== */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* CARD OBJECTIFS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="lg:col-span-2"
              >
                <GlassCard glowColor="violet" className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                        <Target className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-white">Objectifs</h2>
                        <p className="text-xs text-slate-500">{stats.inProgress} en cours • {stats.completed} terminés</p>
                      </div>
                    </div>
                    <CircularProgress value={stats.averageProgress} size={60} color="violet" />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {filteredGoals.length === 0 ? (
                      <div className="text-center py-8">
                        <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">Aucun objectif pour cette période</p>
                      </div>
                    ) : (
                      filteredGoals.map((goal, index) => {
                        const cat = getCategoryBadge(goal.categoryId);
                        const prio = getPriorityBadge(goal.priority || '');
                        const nextMilestone = getNextMilestone(goal);

                        return (
                          <GoalCard
                            key={goal.id}
                            goal={goal}
                            index={index}
                            category={cat}
                            priority={prio}
                            nextMilestone={nextMilestone}
                            onClick={() => setSelectedGoal(goal)}
                            getCategoryColor={getCategoryColor}
                          />
                        );
                      })
                    )}
                  </div>
                </GlassCard>
              </motion.div>

              {/* CARD TÂCHES */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <GlassCard glowColor="emerald" className="p-5 h-[300px] flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <h2 className="text-sm font-semibold text-white">Tâches</h2>
                    </div>
                    <span className="text-xs text-slate-500">{stats.todayTasks} en cours</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {tasks.filter(t => t.status !== 'completed').slice(0, 8).map((task, i) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200"
                      >
                        <Circle className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-white truncate flex-1">{task.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          task.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                          task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {task.priority === 'high' ? '!' : task.priority === 'medium' ? '-' : '○'}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* CARD RENDEZ-VOUS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <GlassCard glowColor="cyan" className="p-5 h-[300px] flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-sm font-semibold text-white">Rendez-vous</h2>
                    </div>
                    <span className="text-xs text-slate-500">{stats.todayEvents} aujourd'hui</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {events.slice(0, 6).map((event, i) => {
                      // Utiliser startTime en priorité (champ dérivé), fallback sur startAt
                      const eventTime = event.startTime || (event.startAt ? event.startAt.split('T')[1]?.substring(0, 5) : '??:??');
                      const eventDate = event.date || (event.startAt ? event.startAt.split('T')[0] : '');
                      const isToday = eventDate === new Date().toISOString().split('T')[0];
                      
                      return (
                        <div
                          key={event.id}
                          onClick={() => {
                            console.log('🔍 Event click:', event.title, 'goalId:', event.goalId, 'milestoneId:', event.milestoneId);
                            console.log('📋 Tasks:', tasks.map(t => ({ title: t.title, eventId: t.eventId, dueDate: t.dueDate, startDate: t.startDate })));
                            
                            // 1. Si l'événement est lié à un objectif (goalId ou milestoneId) → GoalModal
                            if (event.goalId || event.milestoneId) {
                              const relatedGoal = goals.find(g => g.id === event.goalId);
                              if (relatedGoal) {
                                console.log('✅ Objectif trouvé via goalId');
                                setSelectedGoal(relatedGoal);
                                return;
                              }
                            }
                            // 2. Si l'événement est lié à une tâche → TaskModal
                            // 2a. Via eventId
                            let relatedTask = tasks.find(t => t.eventId === event.id);
                            if (relatedTask) {
                              console.log('✅ Tâche trouvée via eventId');
                              setSelectedTask(relatedTask);
                              setShowTaskModal(true);
                              return;
                            }
                            // 2b. Fallback: par titre exact et date (dueDate)
                            relatedTask = tasks.find(t => {
                              if (!t.dueDate || !event.date) return false;
                              const taskDate = t.dueDate.split('T')[0];
                              const eventDate = event.date;
                              return t.title.toLowerCase().trim() === event.title.toLowerCase().trim() && taskDate === eventDate;
                            });
                            if (relatedTask) {
                              console.log('✅ Tâche trouvée via titre+dueDate');
                              setSelectedTask(relatedTask);
                              setShowTaskModal(true);
                              return;
                            }
                            // 2c. Fallback: par titre exact (sans date)
                            relatedTask = tasks.find(t => t.title.toLowerCase().trim() === event.title.toLowerCase().trim());
                            if (relatedTask) {
                              console.log('✅ Tâche trouvée via titre');
                              setSelectedTask(relatedTask);
                              setShowTaskModal(true);
                              return;
                            }
                            // 2d. Fallback: par startDate
                            relatedTask = tasks.find(t => {
                              if (!t.startDate || !event.date) return false;
                              const taskDate = t.startDate.split('T')[0];
                              return t.title.toLowerCase().trim() === event.title.toLowerCase().trim() && taskDate === event.date;
                            });
                            if (relatedTask) {
                              console.log('✅ Tâche trouvée via startDate');
                              setSelectedTask(relatedTask);
                              setShowTaskModal(true);
                              return;
                            }
                            // 2e. Fallback: normalisation des accents + suppression emojis
                            const normalizeString = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                            const removeEmojis = (str: string) => str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
                            const eventTitleNorm = normalizeString(removeEmojis(event.title));
                            relatedTask = tasks.find(t => normalizeString(t.title) === eventTitleNorm);
                            if (relatedTask) {
                              console.log('✅ Tâche trouvée via titre normalisé sans emojis');
                              setSelectedTask(relatedTask);
                              setShowTaskModal(true);
                              return;
                            }
                            // 2f. Fallback: titre sans emojis + startDate
                            const eventTitleNoEmoji = removeEmojis(event.title).toLowerCase().trim();
                            relatedTask = tasks.find(t => {
                              if (!t.startDate || !event.date) return false;
                              const taskStartDate = t.startDate.split('T')[0];
                              const eventDateStr = event.date;
                              const titleMatch = removeEmojis(t.title).toLowerCase().trim() === eventTitleNoEmoji;
                              return titleMatch && taskStartDate === eventDateStr;
                            });
                            if (relatedTask) {
                              console.log('✅ Tâche trouvée via titre sans emojis + startDate');
                              setSelectedTask(relatedTask);
                              setShowTaskModal(true);
                              return;
                            }
                            // 3. Sinon → EventModal classique
                            console.log('❌ Aucune tâche trouvée, ouverture EventModal');
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-[10px] text-cyan-400 font-mono whitespace-nowrap">
                              {eventTime}
                            </div>
                            <span className="text-xs text-white truncate flex-1">{event.title}</span>
                            {!isToday && eventDate && (
                              <span className="text-[9px] text-slate-500">
                                {new Date(eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* ========== SIDEBAR DROITE - TIMER & HABITUDES ========== */}
            <div className="w-[280px] space-y-4 flex-shrink-0">

              {/* TIMER FOCUS - Toujours visible */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <TimerDisplay
                  isActive={timerActive}
                  isPaused={timerPaused}
                  seconds={timerSeconds}
                  target={timerTarget}
                  goal={timerGoal}
                  milestone={timerMilestone}
                  onTogglePause={togglePauseTimer}
                  onStop={stopTimer}
                />
              </motion.div>

              {/* HABITUDES */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <GlassCard glowColor="amber" className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">Habitudes</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-amber-400 font-bold">{stats.streak}j</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {habits.slice(0, 5).map((habit) => (
                      <div key={habit.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                        <span className="text-lg">{habit.icon}</span>
                        <span className="text-xs text-white truncate flex-1">{habit.title}</span>
                        {habit.streak >= 7 && (
                          <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* QUICK STATS */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <GlassCard className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 rounded-lg bg-violet-500/10">
                      <div className="text-xl font-bold text-violet-400">{stats.totalGoals}</div>
                      <div className="text-[9px] text-slate-500">Total</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                      <div className="text-xl font-bold text-emerald-400">{stats.completed}</div>
                      <div className="text-[9px] text-slate-500">Terminés</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        )}
      </main>

      {/* ========== 3 MODALES RÉUTILISABLES ========== */}
      
      {/* Modal Création Objectif */}
      <GoalModal
        isOpen={showNewGoalModal}
        onClose={() => setShowNewGoalModal(false)}
        onCreate={handleCreateGoal}
      />

      {/* Modal Détail/Édition Objectif */}
      <GoalModal
        goal={selectedGoal}
        isOpen={!!selectedGoal}
        onClose={() => { setSelectedGoal(null); setIsEditingGoal(false); }}
        onStartTimer={(goal, milestone) => { startTimer(goal, milestone); }}
      />

      {/* Modal Tâche */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        task={selectedTask}
      />

      {/* Modal Événement */}
      {showEventModal && selectedEvent && (
        <CreateEventModal
          date={selectedEvent.date || new Date().toISOString().split('T')[0]}
          event={selectedEvent}
          categories={categories}
          onClose={() => setShowEventModal(false)}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS FOR FRAMER MOTION ANIMATIONS
// ============================================================================

// Task Progress Bar Component with Framer Motion animation
function TaskProgressBar({ progress }: { progress: number }) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
    />
  );
}

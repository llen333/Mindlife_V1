'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Target,
  Sunrise,
  Sunset,
  Sparkles,
  Plus,
  ChevronRight,
  Play,
  CalendarDays,
} from 'lucide-react';
import { Goal, GoalMilestone, useStore } from '@/lib/store';
import { CircularProgress } from '@/components/ui/circular-progress';
import { ProgressBar } from '@/components/ui/progress-bar';
import { MiniTimeline } from '@/components/ui/mini-timeline';
import { GlassCard } from '@/components/ui/glass-card';
import {
  GOAL_CATEGORIES,
  GOAL_PRIORITIES,
  getCategoryColor,
  getCategoryBadge,
  getPriorityBadge,
} from '@/lib/data/constants';
import {
  syncMilestonesWithCalendar,
  deleteGoalMilestoneEvents,
} from '@/lib/services/milestoneCalendarService';

// ============================================================================
// TYPES
// ============================================================================

interface Milestone extends GoalMilestone {
  description?: string;
  actualTime?: number;
  actions?: string[];
}

interface GoalModalProps {
  goal?: Goal | null;  // Optionnel pour supporter la création
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  onCreate?: (goal: Partial<Goal>) => Promise<void>;
  onDelete?: (goalId: string) => Promise<void>;
  onStartTimer?: (goal: Goal, milestone: Milestone) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
};

/**
 * Calcule le nombre de jours entre deux dates (inclusif)
 * Exemple: du 15 au 18 avril = 4 jours
 */
const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de début
  return Math.max(1, diffDays);
};

/**
 * Génère des étapes simples basées sur le nombre de jours
 */
const generateMilestonesForDays = (
  goalTitle: string,
  categoryId: string,
  numberOfDays: number
): Milestone[] => {
  const patterns = [
    { title: 'Lancement', estimatedTime: 20 },
    { title: 'Analyse', estimatedTime: 30 },
    { title: 'Planification', estimatedTime: 25 },
    { title: 'Développement', estimatedTime: 60 },
    { title: 'Mise en œuvre', estimatedTime: 45 },
    { title: 'Suivi', estimatedTime: 30 },
    { title: 'Ajustements', estimatedTime: 25 },
    { title: 'Consolidation', estimatedTime: 40 },
    { title: 'Finalisation', estimatedTime: 35 },
    { title: 'Révision', estimatedTime: 20 },
    { title: 'Préparation finale', estimatedTime: 25 },
    { title: 'Validation', estimatedTime: 15 },
    { title: 'Bilan', estimatedTime: 20 },
    { title: 'Documentation', estimatedTime: 30 },
  ];

  const milestones: Milestone[] = [];
  for (let i = 0; i < numberOfDays; i++) {
    const pattern = patterns[i % patterns.length];
    milestones.push({
      id: `milestone-${Date.now()}-${i}`,
      title: `Étape ${i + 1}: ${pattern.title}`,
      completed: false,
      estimatedTime: pattern.estimatedTime,
      order: i,
      actions: ['À définir'],
    });
  }
  return milestones;
};

/**
 * Assigne une date à chaque étape (1 étape par jour)
 */
const assignDatesToMilestones = (
  milestones: Milestone[],
  startDate: string,
  endDate: string
): Milestone[] => {
  if (!startDate || milestones.length === 0) return milestones;

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  const totalDays = calculateDaysBetween(startDate, endDate);

  return milestones.map((m, index) => {
    // Chaque étape = 1 jour, répartis uniformément
    const dayOffset = Math.floor((index / Math.max(1, milestones.length - 1)) * (totalDays - 1));
    const milestoneDate = new Date(start);
    milestoneDate.setDate(start.getDate() + dayOffset);

    return {
      ...m,
      dueDate: milestoneDate.toISOString().split('T')[0],
      order: index,
    };
  });
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function GoalModal({
  goal,
  isOpen,
  onClose,
  onUpdate,
  onCreate,
  onDelete,
  onStartTimer,
}: GoalModalProps) {
  const isCreating = !goal;  // Mode création si pas de goal
  const { updateGoal: storeUpdateGoal, deleteGoal: storeDeleteGoal, loadEvents, currentUserId } = useStore();
  const userId = currentUserId || 'mindlife-user';

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    categoryId: 'cat-personal',
    priority: 'a_planifier',
    startDate: '',
    endDate: '',
    targetValue: '',
    unit: '',
    milestones: [] as Milestone[],
    defaultTime: '09:00',
    syncWithCalendar: true,
    numberOfSteps: 5,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when goal changes or when creating
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (goal) {
      setEditForm({
        title: goal.title,
        description: goal.description || '',
        categoryId: goal.categoryId || 'cat-personal',
        priority: goal.priority || 'a_planifier',
        startDate: goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '',
        endDate: goal.endDate ? new Date(goal.endDate).toISOString().split('T')[0] : '',
        targetValue: goal.targetValue?.toString() || '',
        unit: goal.unit || '',
        milestones: (goal.milestones || []) as Milestone[],
        defaultTime: '09:00',
        syncWithCalendar: true,
        numberOfSteps: 5,
      });
      setIsEditing(false);
    } else {
      // Mode création: reset le formulaire
      setEditForm({
        title: '',
        description: '',
        categoryId: 'cat-personal',
        priority: 'a_planifier',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        targetValue: '',
        unit: '',
        milestones: [],
        defaultTime: '09:00',
        syncWithCalendar: true,
        numberOfSteps: 5,
      });
      setIsEditing(true);  // En mode création, on est toujours en édition
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [goal, isOpen]);

  const handleUpdate = onUpdate || storeUpdateGoal;
  const handleDelete = onDelete || storeDeleteGoal;
  
  // Handler pour la création
  const handleCreate = async () => {
    if (!onCreate) return;
    
    setIsSaving(true);
    try {
      await onCreate({
        title: editForm.title,
        description: editForm.description,
        categoryId: editForm.categoryId,
        priority: editForm.priority,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        targetValue: editForm.targetValue ? parseFloat(editForm.targetValue) : undefined,
        unit: editForm.unit,
        milestones: editForm.milestones,
        completedMilestones: 0,
        totalMilestones: editForm.milestones.length,
        progress: 0,
        status: 'active',
      });
      onClose();
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMilestone = async (milestoneIndex: number) => {
    if (!goal) return;

    const updatedMilestones = editForm.milestones.map((m, i) =>
      i === milestoneIndex ? { ...m, completed: !m.completed } : m
    );

    setEditForm(prev => ({ ...prev, milestones: updatedMilestones }));

    // Calculer le nouveau progrès
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const totalCount = updatedMilestones.length;
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    await handleUpdate(goal.id, {
      milestones: updatedMilestones,
      completedMilestones: completedCount,
      totalMilestones: totalCount,
      milestonesProgress: newProgress,
      progress: newProgress,
    });
  };

  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      title: `Nouvelle étape`,
      completed: false,
      dueDate: editForm.endDate || editForm.startDate,
      order: editForm.milestones.length,
    };
    setEditForm(prev => ({ ...prev, milestones: [...prev.milestones, newMilestone] }));
  };

  const handleRemoveMilestone = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i })),
    }));
  };

  const handleGenerateMilestones = () => {
    if (!editForm.startDate || !editForm.endDate) return;

    // Nombre d'étapes = nombre de jours
    const numberOfDays = calculateDaysBetween(editForm.startDate, editForm.endDate);
    const milestones = generateMilestonesForDays(editForm.title || 'Objectif', editForm.categoryId, numberOfDays);
    const withDates = assignDatesToMilestones(milestones, editForm.startDate, editForm.endDate);

    setEditForm(prev => ({ ...prev, milestones: withDates }));
  };

  const handleRedistributeDates = () => {
    if (!editForm.startDate || !editForm.endDate || editForm.milestones.length === 0) return;

    const redistributed = assignDatesToMilestones(editForm.milestones, editForm.startDate, editForm.endDate);
    setEditForm(prev => ({ ...prev, milestones: redistributed }));
  };

  const handleSaveEdit = async () => {
    if (!goal) return;

    setIsSaving(true);
    try {
      // Calculer le progrès
      const completedCount = editForm.milestones.filter(m => m.completed).length;
      const totalCount = editForm.milestones.length;
      const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      await handleUpdate(goal.id, {
        title: editForm.title,
        description: editForm.description,
        categoryId: editForm.categoryId,
        priority: editForm.priority,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        targetValue: editForm.targetValue ? parseFloat(editForm.targetValue) : undefined,
        unit: editForm.unit,
        milestones: editForm.milestones,
        completedMilestones: completedCount,
        totalMilestones: totalCount,
        milestonesProgress: newProgress,
        progress: newProgress,
      });

      // Synchroniser avec le calendrier si demandé
      if (editForm.syncWithCalendar && editForm.milestones.length > 0 && editForm.startDate && editForm.endDate) {
        const category = getCategoryBadge(editForm.categoryId);
        await syncMilestonesWithCalendar(
          goal.id,
          editForm.title,
          editForm.milestones,
          editForm.startDate,
          editForm.endDate,
          editForm.defaultTime,
          userId,
          editForm.categoryId,
          category.color
        );
        await loadEvents();
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!goal) return;
    if (!confirm('Es-tu sûr de vouloir supprimer cet objectif ?')) return;

    try {
      await deleteGoalMilestoneEvents(goal.id, userId);
      await handleDelete(goal.id);
      onClose();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  if (!isOpen) return null;

  const category = goal ? getCategoryBadge(goal.categoryId) : getCategoryBadge(editForm.categoryId);
  const priority = goal ? getPriorityBadge(goal.priority) : getPriorityBadge(editForm.priority);
  const numberOfDays = editForm.startDate && editForm.endDate
    ? calculateDaysBetween(editForm.startDate, editForm.endDate)
    : 0;

  // Animation variants
  const modalOverlay = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const modalContent = {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { scale: 0.95, opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlay}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          style={{ zIndex: 99999 }}
          onClick={onClose}
        >
          <motion.div
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <GlassCard glowColor="violet" className="p-0 overflow-hidden">
              {/* Scrollable content container */}
              <div className="p-6 overflow-y-auto max-h-[85vh]">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${category.color}-500/20 border border-${category.color}-500/30 flex items-center justify-center`}>
                    <Target className={`w-6 h-6 text-${category.color}-400`} />
                  </div>
                  <div>
                    {isEditing || isCreating ? (
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="text-xl font-bold text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1 w-full"
                        placeholder="Titre de l'objectif"
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-white">{goal?.title}</h2>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {isEditing || isCreating ? (
                        <select
                          value={editForm.priority}
                          onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                          className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white"
                        >
                          {GOAL_PRIORITIES.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${priority.color}-500/20 text-${priority.color}-400`}>
                          {priority.name}
                        </span>
                      )}
                      {isEditing || isCreating ? (
                        <select
                          value={editForm.categoryId}
                          onChange={(e) => setEditForm(prev => ({ ...prev, categoryId: e.target.value }))}
                          className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white"
                        >
                          {GOAL_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-slate-500">{category.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* DATES - Focus visuel */}
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-cyan-500/10 border border-violet-500/20">
                <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dates de l'Objectif {numberOfDays > 0 && <span className="text-cyan-400">({numberOfDays} jours = {numberOfDays} étapes)</span>}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Date de début */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sunrise className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs text-cyan-300 font-medium uppercase tracking-wider">Début</span>
                    </div>
                    {isEditing || isCreating ? (
                      <input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full text-lg font-bold text-white bg-transparent border-b-2 border-cyan-500/50 focus:border-cyan-400 outline-none"
                      />
                    ) : (
                      <div className="text-xl font-bold text-white">
                        {goal?.startDate ? new Date(goal.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non définie'}
                      </div>
                    )}
                  </div>
                  {/* Date de fin */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sunset className="w-5 h-5 text-violet-400" />
                      <span className="text-xs text-violet-300 font-medium uppercase tracking-wider">Deadline</span>
                    </div>
                    {isEditing || isCreating ? (
                      <input
                        type="date"
                        value={editForm.endDate}
                        min={editForm.startDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full text-lg font-bold text-white bg-transparent border-b-2 border-violet-500/50 focus:border-violet-400 outline-none"
                      />
                    ) : (
                      <div className="text-xl font-bold text-white">
                        {goal?.endDate ? new Date(goal.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non définie'}
                      </div>
                    )}
                  </div>
                </div>
                {/* Timeline visuelle */}
                {!isCreating && (
                  <div className="mt-4">
                    <MiniTimeline start={goal?.startDate} end={goal?.endDate} progress={goal?.progress || 0} />
                  </div>
                )}
              </div>

              {/* Progress - Seulement en mode édition, pas en création */}
              {!isCreating && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Progression globale</span>
                    <span className="text-lg font-bold text-white">{goal?.progress || 0}%</span>
                  </div>
                  <ProgressBar progress={goal?.progress || 0} color={getCategoryColor(goal?.categoryId)} />
                </div>
              )}

              {/* Description */}
              {(isEditing || isCreating) && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ajouter une description..."
                    className="w-full h-20 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-white text-sm resize-none focus:border-violet-500/50 outline-none"
                  />
                </div>
              )}
              {!isEditing && !isCreating && goal?.description && (
                <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-slate-300">{goal.description}</p>
                </div>
              )}

              {/* Étapes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Étapes ({(isEditing || isCreating) ? editForm.milestones.filter(m => m.completed).length : goal?.completedMilestones || 0}/{(isEditing || isCreating) ? editForm.milestones.length : goal?.totalMilestones || 0})
                  </h3>
                </div>

                {isEditing || isCreating ? (
                  <>
                    {/* Contrôles d'édition */}
                    <div className="space-y-3 mb-4">
                      {/* Boutons d'action */}
                      {editForm.startDate && editForm.endDate && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleGenerateMilestones}
                            className="flex-1 px-3 py-2 text-xs bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Générer {numberOfDays} étapes (1/jour)
                          </button>
                          {editForm.milestones.length > 0 && (
                            <button
                              onClick={handleRedistributeDates}
                              className="px-3 py-2 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                              title="Redistribuer les dates entre début et fin"
                            >
                              <CalendarDays className="w-3.5 h-3.5" />
                              Redistribuer
                            </button>
                          )}
                          <label className="flex items-center gap-1 px-2 py-2 text-xs bg-emerald-500/10 text-emerald-400 rounded-lg cursor-pointer">
                            <Calendar className="w-3 h-3" />
                            <input
                              type="checkbox"
                              checked={editForm.syncWithCalendar}
                              onChange={(e) => setEditForm(prev => ({ ...prev, syncWithCalendar: e.target.checked }))}
                              className="w-3 h-3"
                            />
                          </label>
                        </div>
                      )}

                      {/* Bouton ajouter */}
                      <button
                        onClick={handleAddMilestone}
                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Ajouter une étape
                      </button>
                    </div>

                    {/* Liste des étapes éditables */}
                    <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                      {editForm.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] group">
                          <span className="text-xs text-slate-500 w-5">{index + 1}</span>
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => {
                              const updated = [...editForm.milestones];
                              updated[index] = { ...updated[index], title: e.target.value };
                              setEditForm(prev => ({ ...prev, milestones: updated }));
                            }}
                            className="flex-1 px-2 py-1 text-sm bg-transparent border-none text-white focus:outline-none"
                          />
                          <input
                            type="date"
                            value={milestone.dueDate ? milestone.dueDate.split('T')[0] : ''}
                            onChange={(e) => {
                              const updated = [...editForm.milestones];
                              updated[index] = { ...updated[index], dueDate: e.target.value };
                              setEditForm(prev => ({ ...prev, milestones: updated }));
                            }}
                            className="px-2 py-1 text-xs bg-white/5 border border-white/10 text-white rounded"
                          />
                          <button
                            onClick={() => handleRemoveMilestone(index)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {editForm.milestones.length === 0 && (
                        <div className="text-center py-4 text-slate-500 text-sm">
                          Aucune étape. Cliquez sur "Générer" pour créer {numberOfDays} étapes automatiquement.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Mode affichage des étapes
                  <div className="space-y-2">
                    {goal?.milestones?.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className={`p-3 rounded-xl border transition-all ${
                          milestone.completed
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-white/[0.02] border-white/[0.05] hover:border-violet-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleMilestone(index)}
                            className="flex-shrink-0"
                          >
                            {milestone.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500 hover:text-violet-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm ${milestone.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                              {milestone.title}
                            </span>
                            {milestone.dueDate && (
                              <span className="text-xs text-cyan-400 ml-2">
                                📅 {new Date(milestone.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                            {milestone.estimatedTime && (
                              <span className="text-xs text-violet-400 ml-2">
                                ⏱ {formatTime(milestone.estimatedTime)}
                              </span>
                            )}
                          </div>

                          {/* Bouton Focus pour l'étape en cours */}
                          {!milestone.completed && onStartTimer && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartTimer(goal, milestone as Milestone);
                                onClose();
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-400 text-xs hover:bg-violet-500/30 transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              Focus
                            </button>
                          )}
                        </div>

                        {/* Actions de l'étape */}
                        {milestone.actions && milestone.actions.length > 0 && (
                          <div className="mt-2 pl-8 text-xs text-slate-500">
                            {milestone.actions.map((action, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <ChevronRight className="w-2 h-2" />
                                {action}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {isCreating ? (
                  <>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={isSaving || !editForm.title.trim() || !editForm.endDate}
                      className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium disabled:opacity-50"
                    >
                      {isSaving ? 'Création...' : '✨ Créer l\'objectif'}
                    </button>
                  </>
                ) : isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium"
                    >
                      {isSaving ? 'Sauvegarde...' : '✓ Enregistrer'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleDeleteGoal}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4 inline mr-2" />
                      Modifier
                    </button>
                  </>
                )}
              </div>
              </div>{/* End scrollable container */}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

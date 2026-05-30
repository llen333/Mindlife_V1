// RoutineModal - Version Complète avec Édition, Étapes, Timer
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Plus, Check, Clock, Calendar, Play, Pause, RotateCcw,
  Edit2, Save, Trash2, GripVertical, Link, ExternalLink,
  Flame, Trophy, Target, Info, ChevronDown, ChevronUp,
  Lightbulb, Droplets, BookOpen, Timer, Sparkles
} from 'lucide-react';
import type { GrowthRoutine, RoutineStep } from '../types';

// ============================================
// INTERFACE
// ============================================

interface RoutineModalProps {
  isVisible: boolean;
  onClose: () => void;
  routine: GrowthRoutine | null;
  onUpdate?: (id: string, data: Partial<GrowthRoutine>) => void;
  onComplete?: (id: string) => void;
  onCompleteStep?: (routineId: string, stepId: string) => void;
}

interface StepWithTimer extends RoutineStep {
  timerSeconds?: number;
  isTimerRunning?: boolean;
  linkedUrl?: string;
  tips?: string[];
}

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAYS_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Tips pour chaque type d'étape
const STEP_TIPS: Record<string, string[]> = {
  'eau': [
    '💧 Boire 250ml d\'eau froide au réveil active le métabolisme',
    '🍋 Ajouter du citron pour un boost de vitamine C',
    '⏰ Fractionner: 1 verre toutes les 2 heures = 2L/jour',
    '📱 Utiliser une app de rappel hydratation'
  ],
  'méditation': [
    '🧘 Commencer par 5 min, augmenter progressivement',
    '🎵 Utiliser une app (Headspace, Petit Bambou)',
    '🌅 Méditer au même endroit chaque jour',
    '💭 Ne pas juger ses pensées, les observer'
  ],
  'lecture': [
    '📖 20 min de lecture = environ 30 pages',
    '📱 Mode avion pour éviter les distractions',
    '✍️ Prendre des notes dans un carnet',
    '🎯 Définir un objectif de lecture avant de commencer'
  ],
  'exercice': [
    '🏃 Commencer par 10 min d\'échauffement',
    '💧 S\'hydrater avant, pendant et après',
    '🎵 Playlist motivante pour rester focus',
    '📱 Suivre sa progression avec une app'
  ],
  'journal': [
    '✍️ 3 pages de "Morning Pages" pour vider son esprit',
    '🙏 Commencer par 3 gratitudes',
    '🎯 Définir 3 priorités pour la journée',
    '🌙 Le soir: 3 victoires + 1 leçon'
  ],
  'default': [
    '🎯 Définir un objectif clair pour cette étape',
    '⏱️ Utiliser un timer pour rester focus',
    '📱 Éloigner les distractions',
    '✅ Célébrer chaque petite victoire'
  ]
};

// Fonction pour obtenir les tips - définie au niveau du module
const getTipsForStep = (title: string): string[] => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('eau') || titleLower.includes('hydrat')) return STEP_TIPS.eau;
  if (titleLower.includes('médit') || titleLower.includes('mindful')) return STEP_TIPS.méditation;
  if (titleLower.includes('lir') || titleLower.includes('book')) return STEP_TIPS.lecture;
  if (titleLower.includes('exercice') || titleLower.includes('sport') || titleLower.includes('course')) return STEP_TIPS.exercice;
  if (titleLower.includes('journal') || titleLower.includes('écrir')) return STEP_TIPS.journal;
  return STEP_TIPS.default;
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function RoutineModal({ 
  isVisible, 
  onClose, 
  routine, 
  onUpdate,
  onComplete,
  onCompleteStep 
}: RoutineModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  
  // Mode édition
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDays, setEditDays] = useState<number[]>([]);
  const [editSteps, setEditSteps] = useState<StepWithTimer[]>([]);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDuration, setNewStepDuration] = useState(5);
  const [newStepUrl, setNewStepUrl] = useState('');
  
  // État des étapes
  const [steps, setSteps] = useState<StepWithTimer[]>([]);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Étape sélectionnée pour détails
  const [selectedStep, setSelectedStep] = useState<StepWithTimer | null>(null);
  const [showStepTips, setShowStepTips] = useState(false);

  // Mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialiser les données
  useEffect(() => {
    if (routine) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditTitle(routine.title);
      setEditDescription(routine.description);
      setEditTime(routine.timeOfDay || '');
      setEditDays(routine.daysOfWeek || []);
      setEditSteps(routine.steps.map(s => ({
        ...s,
        timerSeconds: (s.duration || 5) * 60,
        isTimerRunning: false,
        tips: getTipsForStep(s.title)
      })));
      setSteps(routine.steps.map(s => ({
        ...s,
        timerSeconds: (s.duration || 5) * 60,
        isTimerRunning: false,
        tips: getTipsForStep(s.title)
      })));
    }
  }, [routine]);

  // Timer effect
  useEffect(() => {
    if (activeTimer && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setActiveTimer(null);
            // Notification sonore
            try {
              const audio = new Audio('/notification.mp3');
              audio.play().catch(() => {});
            } catch {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTimer]);

  // Fermer sur Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedStep) {
          setSelectedStep(null);
        } else {
          onClose();
        }
      }
    };
    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose, selectedStep]);

  // Calculer le temps total
  const calculateTotalTime = (stepsList: StepWithTimer[]): number => {
    return stepsList.reduce((acc, s) => acc + (s.duration || 0), 0);
  };

  // Formater le temps
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle jour
  const toggleDay = (day: number) => {
    setEditDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  // Ajouter une étape
  const addStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep: StepWithTimer = {
      id: `step-${Date.now()}`,
      title: newStepTitle.trim(),
      duration: newStepDuration,
      order: editSteps.length,
      isCompleted: false,
      timerSeconds: newStepDuration * 60,
      linkedUrl: newStepUrl.trim() || undefined,
      tips: getTipsForStep(newStepTitle)
    };
    setEditSteps([...editSteps, newStep]);
    setNewStepTitle('');
    setNewStepDuration(5);
    setNewStepUrl('');
  };

  // Supprimer une étape
  const removeStep = (stepId: string) => {
    setEditSteps(editSteps.filter(s => s.id !== stepId));
  };

  // Déplacer une étape
  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...editSteps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSteps.length) return;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    newSteps.forEach((s, i) => s.order = i);
    setEditSteps(newSteps);
  };

  // Sauvegarder les modifications
  const saveChanges = () => {
    if (!routine || !onUpdate) return;
    onUpdate(routine.id, {
      title: editTitle,
      description: editDescription,
      timeOfDay: editTime,
      daysOfWeek: editDays,
      steps: editSteps.map((s, i) => ({
        ...s,
        order: i
      })),
      duration: calculateTotalTime(editSteps)
    });
    setIsEditing(false);
  };

  // Démarrer/arrêter le timer
  const toggleTimer = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    if (activeTimer === stepId) {
      // Pause
      setActiveTimer(null);
      setSteps(steps.map(s => 
        s.id === stepId ? { ...s, isTimerRunning: false } : s
      ));
    } else {
      // Start
      setActiveTimer(stepId);
      setTimerSeconds(step.timerSeconds || (step.duration || 5) * 60);
      setSteps(steps.map(s => 
        s.id === stepId ? { ...s, isTimerRunning: true } : { ...s, isTimerRunning: false }
      ));
    }
  };

  // Reset timer
  const resetTimer = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    if (activeTimer === stepId) {
      setActiveTimer(null);
    }
    setSteps(steps.map(s => 
      s.id === stepId 
        ? { ...s, timerSeconds: (s.duration || 5) * 60, isTimerRunning: false } 
        : s
    ));
    setTimerSeconds((step.duration || 5) * 60);
  };

  // Marquer une étape comme complétée
  const completeStep = (stepId: string) => {
    setSteps(steps.map(s => 
      s.id === stepId 
        ? { ...s, isCompleted: true } 
        : s
    ));
    if (onCompleteStep && routine) {
      onCompleteStep(routine.id, stepId);
    }
    // Arrêter le timer si en cours
    if (activeTimer === stepId) {
      setActiveTimer(null);
    }
  };

  if (!mounted || !routine) return null;

  const totalTime = calculateTotalTime(isEditing ? editSteps : steps);
  const completedSteps = steps.filter(s => s.isCompleted).length;
  const progressPercent = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  // ============================================
  // MODAL CONTENU
  // ============================================

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          selectedStep ? setSelectedStep(null) : onClose();
        }
      }}
    >
      {/* NO dark overlay - transparent background */}
      
      <div 
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${routine.color}20` }}
              >
                {routine.icon}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-transparent text-xl font-light text-white border-b border-white/20 focus:border-white/40 outline-none w-full"
                  />
                ) : (
                  <h2 className="text-xl font-light text-white tracking-wide">{routine.title}</h2>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description..."
                    className="bg-transparent text-white/50 text-sm border-b border-white/10 focus:border-white/20 outline-none w-full mt-1"
                  />
                ) : (
                  <p className="text-white/50 text-sm mt-1">{routine.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={saveChanges}
                    className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats avec explications */}
          <div className="grid grid-cols-3 gap-4">
            <div className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-white/60 text-xs uppercase tracking-wider">Série actuelle</span>
                <Info className="w-3 h-3 text-white/30 cursor-help" />
              </div>
              <div className="text-3xl font-light text-white">{routine.currentStreak}</div>
              <div className="text-white/40 text-xs mt-1">jours consécutifs</div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-slate-900 text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                Nombre de jours d'affilée où cette routine a été complétée
              </div>
            </div>
            
            <div className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span className="text-white/60 text-xs uppercase tracking-wider">Meilleure série</span>
                <Info className="w-3 h-3 text-white/30 cursor-help" />
              </div>
              <div className="text-3xl font-light text-emerald-400">{routine.bestStreak}</div>
              <div className="text-white/40 text-xs mt-1">jours record</div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-slate-900 text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                Votre record personnel à battre !
              </div>
            </div>
            
            <div className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-white/60 text-xs uppercase tracking-wider">Total</span>
                <Info className="w-3 h-3 text-white/30 cursor-help" />
              </div>
              <div className="text-3xl font-light text-white">{routine.totalCompletions}</div>
              <div className="text-white/40 text-xs mt-1">fois réalisée</div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-slate-900 text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                Nombre total de fois que cette routine a été complétée
              </div>
            </div>
          </div>

          {/* Horaire et jours */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-white/40" />
              <span className="text-white/60 text-xs uppercase tracking-wider">Programmation</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Heure */}
              {isEditing ? (
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 outline-none"
                />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-white">{routine.timeOfDay || 'Non définie'}</span>
                </div>
              )}
              
              {/* Durée totale */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                <Timer className="w-4 h-4 text-emerald-400" />
                <span className="text-white">{totalTime} min total</span>
              </div>
              
              {/* Jours */}
              <div className="flex gap-1">
                {DAYS.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => isEditing && toggleDay(i)}
                    disabled={!isEditing}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                      (isEditing ? editDays : routine.daysOfWeek)?.includes(i)
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/30 border border-transparent'
                    } ${isEditing ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'}`}
                  >
                    {day[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress de la routine */}
          {!isEditing && steps.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-xs uppercase tracking-wider">Progression aujourd'hui</span>
                <span className="text-white">{completedSteps}/{steps.length} étapes</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Liste des étapes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-white/40" />
                <span className="text-white/60 text-xs uppercase tracking-wider">Étapes</span>
                <span className="text-white/40 text-xs">
                  {isEditing ? editSteps.length : steps.length} étape(s)
                </span>
              </div>
              {!isEditing && (
                <div className="text-white/40 text-xs flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  Cliquez sur une étape pour voir les conseils
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {(isEditing ? editSteps : steps).map((step, index) => (
                <div
                  key={step.id}
                  className={`group relative overflow-hidden rounded-xl border transition-all ${
                    step.isCompleted 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  } ${!isEditing ? 'cursor-pointer' : ''}`}
                  onClick={() => !isEditing && setSelectedStep(step)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Ordre / Drag handle */}
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); moveStep(index, 'up'); }}
                            disabled={index === 0}
                            className="p-1 rounded text-white/30 hover:text-white/60 disabled:opacity-30"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <GripVertical className="w-4 h-4 text-white/30" />
                          <button
                            onClick={(e) => { e.stopPropagation(); moveStep(index, 'down'); }}
                            disabled={index === editSteps.length - 1}
                            className="p-1 rounded text-white/30 hover:text-white/60 disabled:opacity-30"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.isCompleted 
                            ? 'bg-emerald-500 text-black' 
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {step.isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                        </div>
                      )}
                      
                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-light">{step.title}</div>
                        {step.description && (
                          <div className="text-white/40 text-sm mt-1">{step.description}</div>
                        )}
                        {/* Lien */}
                        {step.linkedUrl && (
                          <a
                            href={step.linkedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-blue-400 text-xs hover:underline mt-1"
                          >
                            <Link className="w-3 h-3" />
                            {step.linkedUrl}
                          </a>
                        )}
                      </div>
                      
                      {/* Durée / Timer */}
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={step.duration || 5}
                            onChange={(e) => {
                              const newSteps = [...editSteps];
                              newSteps[index] = { ...newSteps[index], duration: parseInt(e.target.value) || 5 };
                              setEditSteps(newSteps);
                            }}
                            min={1}
                            max={120}
                            className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-center text-sm"
                          />
                          <span className="text-white/40 text-sm">min</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {activeTimer === step.id && (
                            <div className="font-mono text-lg text-amber-400">
                              {formatTime(timerSeconds)}
                            </div>
                          )}
                          <div className="text-white/40 text-sm">{step.duration || 5} min</div>
                        </div>
                      )}
                      
                      {/* Actions */}
                      {isEditing ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                          className="p-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* Timer controls */}
                          {!step.isCompleted && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleTimer(step.id); }}
                                className={`p-2 rounded-lg transition-colors ${
                                  activeTimer === step.id
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'text-white/30 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                {activeTimer === step.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); resetTimer(step.id); }}
                                className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {/* Complete button */}
                          {!step.isCompleted && (
                            <button
                              onClick={(e) => { e.stopPropagation(); completeStep(step.id); }}
                              className="p-2 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Ajouter une étape (mode édition) */}
            {isEditing && (
              <div className="mt-4 p-4 rounded-xl border border-dashed border-white/20 bg-white/5">
                <div className="text-white/60 text-xs uppercase tracking-wider mb-3">Ajouter une étape</div>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder="Nom de l'étape..."
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/30 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addStep()}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newStepDuration}
                      onChange={(e) => setNewStepDuration(parseInt(e.target.value) || 5)}
                      min={1}
                      max={120}
                      className="w-20 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-center"
                    />
                    <span className="text-white/40 text-sm">min</span>
                  </div>
                  <input
                    type="url"
                    value={newStepUrl}
                    onChange={(e) => setNewStepUrl(e.target.value)}
                    placeholder="Lien YouTube/web (optionnel)"
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/30 outline-none"
                  />
                  <button
                    onClick={addStep}
                    disabled={!newStepTitle.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bouton Compléter la routine */}
          {!isEditing && onComplete && (
            <button
              onClick={() => {
                onComplete(routine.id);
                onClose();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-light tracking-wider hover:from-emerald-500/30 hover:to-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Marquer la routine comme complétée
            </button>
          )}
        </div>

        {/* Modal Détail Étape */}
        {selectedStep && !isEditing && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl z-20 rounded-3xl overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedStep.isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'
                  }`}>
                    {selectedStep.isCompleted ? <Check className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-light text-white">{selectedStep.title}</h3>
                    <p className="text-white/40 text-sm">{selectedStep.duration || 5} minutes</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStep(null)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              {selectedStep.description && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/70">{selectedStep.description}</p>
                </div>
              )}

              {/* Timer */}
              {!selectedStep.isCompleted && (
                <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="text-center">
                    <div className="font-mono text-5xl text-white mb-4">
                      {formatTime(activeTimer === selectedStep.id ? timerSeconds : (selectedStep.timerSeconds || selectedStep.duration || 5) * 60)}
                    </div>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => toggleTimer(selectedStep.id)}
                        className={`px-6 py-3 rounded-xl flex items-center gap-2 ${
                          activeTimer === selectedStep.id
                            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                            : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {activeTimer === selectedStep.id ? (
                          <>
                            <Pause className="w-5 h-5" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            Démarrer
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => resetTimer(selectedStep.id)}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Conseils */}
              <div className="mb-6">
                <button
                  onClick={() => setShowStepTips(!showStepTips)}
                  className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider hover:text-white/80"
                >
                  <Lightbulb className="w-4 h-4" />
                  Conseils pour réussir cette étape
                  <ChevronDown className={`w-4 h-4 transition-transform ${showStepTips ? 'rotate-180' : ''}`} />
                </button>
                
                {showStepTips && selectedStep.tips && (
                  <div className="mt-4 space-y-2">
                    {selectedStep.tips.map((tip, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm">
                        {tip}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lien externe */}
              {selectedStep.linkedUrl && (
                <div className="mb-6">
                  <a
                    href={selectedStep.linkedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Ressource externe
                  </a>
                </div>
              )}

              {/* Actions */}
              {!selectedStep.isCompleted && (
                <button
                  onClick={() => {
                    completeStep(selectedStep.id);
                    setSelectedStep(null);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-light tracking-wider hover:from-emerald-500/30 hover:to-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Marquer comme terminée
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

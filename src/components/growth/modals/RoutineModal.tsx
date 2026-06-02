// Modale pour ajouter/éditer une routine
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, GripVertical, Clock } from 'lucide-react';
import type { GrowthRoutine, CreateRoutineInput, RoutineStep } from '../types';
import { ROUTINE_TEMPLATES } from '../constants';

interface RoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateRoutineInput) => Promise<boolean>;
  routine?: GrowthRoutine | null;
}

const STEP_ICONS = ['🧘', '💪', '📚', '✍️', '🎯', '🏃', '📖', '🙏', '🎯', '✨'];

export function RoutineModal({ isOpen, onClose, onSubmit, routine }: RoutineModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'morning' | 'evening'>('morning');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [steps, setSteps] = useState<{ title: string; duration: number; icon?: string; name?: string }[]>([]);
  const [newStepName, setNewStepName] = useState('');
  const [newStepDuration, setNewStepDuration] = useState(5);
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (routine) {
        setName(routine.title);
        setType(routine.category as 'morning' | 'evening');
        setDescription(routine.description || '');
        setScheduledTime(routine.timeOfDay || '');
        setSteps((routine.steps as RoutineStep[]).map(s => ({
          title: s.title,
          duration: s.duration ?? 5,
          icon: s.icon,
        })));
      } else {
        setName('');
        setType('morning');
        setDescription('');
        setScheduledTime('');
        setSteps([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [routine]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const addStep = () => {
    if (newStepName.trim()) {
      setSteps([...steps, {
        title: newStepName.trim(),
        duration: newStepDuration,
      }]);
      setNewStepName('');
      setNewStepDuration(5);
    }
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const loadTemplate = (templateType: 'morning' | 'evening') => {
    const template = templateType === 'morning' ? ROUTINE_TEMPLATES.morning : ROUTINE_TEMPLATES.evening;
    setName(template.name);
    setType(templateType);
    setSteps(template.steps.map(s => ({
      title: s.title,
      duration: s.duration,
      icon: s.icon,
    })));
  };

  const handleSubmit = async () => {
    if (!name.trim() || steps.length === 0) return;

    setSaving(true);
    
    await onSubmit({
      title: name,
      category: type,
      description,
      frequency: 'daily',
      timeOfDay: scheduledTime,
      duration: steps.reduce((sum, s) => sum + s.duration, 0),
      steps: steps.map((s, i) => ({
        id: `step-${i}`,
        title: s.title,
        duration: s.duration,
        order: i,
        isCompleted: false,
      })),
      icon: '🎯',
      color: '#f59e0b',
    });
    
    setSaving(false);
    onClose();
  };

  const totalDuration = steps.reduce((acc, s) => acc + s.duration, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="p-6 space-y-5">
              {/* Header */}
              <h2 className="text-xl font-semibold text-white">
                {routine ? 'Modifier la routine' : 'Nouvelle routine'}
              </h2>

              {/* Quick Templates */}
              {!routine && (
                <div className="flex gap-2">
                  <button
                    onClick={() => loadTemplate('morning')}
                    className="flex-1 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/20 transition-all"
                  >
                    🌅 Template Matin
                  </button>
                  <button
                    onClick={() => loadTemplate('evening')}
                    className="flex-1 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm hover:bg-violet-500/20 transition-all"
                  >
                    🌙 Template Soir
                  </button>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setType('morning')}
                    className={`p-3 rounded-xl text-sm transition-all ${
                      type === 'morning' 
                        ? 'bg-amber-500/20 border border-amber-500/40 text-white' 
                        : 'bg-slate-800/50 border border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    🌅 Matinale
                  </button>
                  <button
                    onClick={() => setType('evening')}
                    className={`p-3 rounded-xl text-sm transition-all ${
                      type === 'evening' 
                        ? 'bg-violet-500/20 border border-violet-500/40 text-white' 
                        : 'bg-slate-800/50 border border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    🌙 Du soir
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Nom *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Routine Miracle Morning"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-amber-500/40 focus:outline-none transition-colors"
                />
              </div>

              {/* Scheduled Time */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Heure programmée</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:border-amber-500/40 focus:outline-none transition-colors"
                />
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">Étapes ({steps.length})</label>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {totalDuration} min total
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50">
                      <span className="text-lg">{step.icon}</span>
                      <span className="flex-1 text-white">{step.name}</span>
                      <span className="text-sm text-slate-400">{step.duration} min</span>
                      <button
                        onClick={() => removeStep(i)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Step */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStepName}
                    onChange={(e) => setNewStepName(e.target.value)}
                    placeholder="Nouvelle étape..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-amber-500/40 focus:outline-none transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && addStep()}
                  />
                  <input
                    type="number"
                    value={newStepDuration}
                    onChange={(e) => setNewStepDuration(parseInt(e.target.value) || 5)}
                    min={1}
                    max={120}
                    className="w-20 px-3 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white text-center focus:border-amber-500/40 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={addStep}
                    className="px-4 py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-700/50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || steps.length === 0 || saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : routine ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

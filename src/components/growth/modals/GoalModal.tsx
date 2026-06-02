// Modale pour ajouter/éditer un objectif
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2 } from 'lucide-react';
import type { GrowthGoal, CreateGoalInput, Milestone, HabitCategory } from '../types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../constants';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateGoalInput) => Promise<boolean>;
  onUpdate?: (id: string, input: Partial<CreateGoalInput>) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  goal?: GrowthGoal | null;
}

const CATEGORIES: HabitCategory[] = ['health', 'mind', 'productivity', 'learning', 'relationships', 'finance', 'spirit', 'creativity'];
const GOAL_TYPES = [
  { id: 'outcome', label: 'Résultat', desc: 'Atteindre un résultat spécifique' },
  { id: 'process', label: 'Processus', desc: 'Établir un processus/habitude' },
  { id: 'identity', label: 'Identité', desc: 'Devenir une certaine personne' },
] as const;

const PHILOSOPHIES = [
  { id: 'none', label: 'Aucune', icon: '📋' },
  { id: 'compound', label: 'Compound Effect', icon: '📈' },
  { id: 'atomic', label: 'Atomic Habits', icon: '⚛️' },
  { id: 'jim-rohn', label: 'Jim Rohn', icon: '🎯' },
  { id: 'neville', label: 'Neville Goddard', icon: '✨' },
] as const;

export function GoalModal({ isOpen, onClose, onSubmit, onUpdate, onDelete, goal }: GoalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'outcome' | 'process' | 'identity'>('outcome');
  const [category, setCategory] = useState<HabitCategory>('productivity');
  const [philosophy, setPhilosophy] = useState<string>('none');
  const [targetValue, setTargetValue] = useState<string>('');
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [identityStatement, setIdentityStatement] = useState('');
  const [milestones, setMilestones] = useState<{ title: string; targetValue?: number }[]>([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description || '');
        setType(goal.type as 'outcome' | 'process' | 'identity');
        setCategory(goal.category as HabitCategory);
        setPhilosophy(goal.philosophy);
        setTargetValue(goal.targetValue?.toString() || '');
        setUnit(goal.unit || '');
        setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
        setIdentityStatement(goal.identityStatement || '');
        setMilestones((goal.milestones as Milestone[])?.map(m => ({ title: m.title, targetValue: m.targetValue })) || []);
      } else {
        setTitle('');
        setDescription('');
        setType('outcome');
        setCategory('productivity');
        setPhilosophy('none');
        setTargetValue('');
        setUnit('');
        setDeadline('');
        setIdentityStatement('');
        setMilestones([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [goal]);

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

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([...milestones, { title: newMilestone.trim() }]);
      setNewMilestone('');
    }
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setSaving(true);
    
    const input: CreateGoalInput = {
      title,
      description,
      type,
      category,
      philosophy: philosophy as 'compound' | 'atomic' | 'jim-rohn' | 'neville' | 'none',
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
      unit,
      deadline: deadline ? new Date(deadline) : undefined,
      identityStatement: type === 'identity' ? identityStatement : undefined,
      milestones: milestones.map((m, i) => ({
        id: `milestone-${i}`,
        title: m.title,
        targetValue: m.targetValue,
        completed: false,
        isCompleted: false,
        order: i,
      })),
    };
    
    if (goal && onUpdate) {
      await onUpdate(goal.id, input);
    } else {
      await onSubmit(input);
    }
    
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (goal && onDelete) {
      await onDelete(goal.id);
      onClose();
    }
  };

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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {goal ? 'Modifier l\'objectif' : 'Nouvel objectif'}
                </h2>
                {goal && onDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Titre *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Courir un marathon"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décris ton objectif..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Type d'objectif</label>
                <div className="space-y-2">
                  {GOAL_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        type === t.id 
                          ? 'bg-cyan-500/20 border border-cyan-500/40' 
                          : 'bg-slate-800/50 border border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="font-medium text-white">{t.label}</span>
                      <span className="text-xs text-slate-400 block">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Identity Statement */}
              {type === 'identity' && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <label className="text-sm font-medium text-purple-300 mb-2 block">
                    Déclaration d'identité
                  </label>
                  <input
                    type="text"
                    value={identityStatement}
                    onChange={(e) => setIdentityStatement(e.target.value)}
                    placeholder="Je suis..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-purple-500/20 text-white placeholder-slate-500 focus:border-purple-500/40 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Catégorie</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        category === cat 
                          ? 'bg-cyan-500/20 border border-cyan-500/40' 
                          : 'bg-slate-800/50 border border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-lg block">{CATEGORY_ICONS[cat]}</span>
                      <span className="text-[10px] text-slate-300">{CATEGORY_LABELS[cat]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Philosophy */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Philosophie</label>
                <div className="grid grid-cols-3 gap-2">
                  {PHILOSOPHIES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPhilosophy(p.id)}
                      className={`p-3 rounded-xl text-sm transition-all ${
                        philosophy === p.id 
                          ? 'bg-cyan-500/20 border border-cyan-500/40 text-white' 
                          : 'bg-slate-800/50 border border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span className="mr-1">{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Value */}
              {(type === 'outcome' || type === 'process') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Valeur cible</label>
                    <input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder="Ex: 42"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Unité</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="Ex: km, kg, livres..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Deadline */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Date limite</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:border-cyan-500/40 focus:outline-none transition-colors"
                />
              </div>

              {/* Milestones */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Étapes clés</label>
                <div className="space-y-2">
                  {milestones.map((milestone, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50">
                      <span className="flex-1 text-white">{milestone.title}</span>
                      <button
                        onClick={() => removeMilestone(i)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      placeholder="Nouvelle étape..."
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
                    />
                    <button
                      onClick={addMilestone}
                      className="px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
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
                  disabled={!title.trim() || saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium hover:from-cyan-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : goal ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

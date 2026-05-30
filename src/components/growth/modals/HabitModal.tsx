// Modale pour ajouter/éditer une habitude
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import type { GrowthHabit, CreateHabitInput, HabitCategory } from '../types';
import { HABIT_ICONS, HABIT_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from '../constants';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateHabitInput) => Promise<boolean>;
  onUpdate?: (id: string, input: Partial<CreateHabitInput>) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  habit?: GrowthHabit | null;
}

const CATEGORIES: HabitCategory[] = ['health', 'mind', 'productivity', 'learning', 'relationships', 'finance', 'spirit', 'creativity'];
const TIME_OPTIONS = ['morning', 'afternoon', 'evening', 'any'] as const;
const TIME_LABELS = {
  morning: '🌅 Matin',
  afternoon: '☀️ Après-midi',
  evening: '🌙 Soir',
  any: '⏰ Flexible',
};

export function HabitModal({ isOpen, onClose, onSubmit, onUpdate, onDelete, habit }: HabitModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#10b981');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'any'>('any');
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (habit) {
        setTitle(habit.title);
        setDescription(habit.description || '');
        setIcon(habit.icon);
        setColor(habit.color);
        setCategory(habit.category as HabitCategory);
        setFrequency(habit.frequency as 'daily' | 'weekly' | 'custom');
        setTimeOfDay(habit.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'any');
      } else {
        setTitle('');
        setDescription('');
        setIcon('🎯');
        setColor('#10b981');
        setCategory('health');
        setFrequency('daily');
        setTimeOfDay('any');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [habit]);

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

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setSaving(true);
    
    if (habit && onUpdate) {
      await onUpdate(habit.id, {
        title,
        description,
        icon,
        color,
        category,
        frequency,
        timeOfDay,
      });
    } else {
      await onSubmit({
        title,
        description,
        icon,
        color,
        category,
        frequency,
        timeOfDay,
      });
    }
    
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (habit && onDelete) {
      await onDelete(habit.id);
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
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {habit ? 'Modifier l\'habitude' : 'Nouvelle habitude'}
                </h2>
                {habit && onDelete && (
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
                  placeholder="Ex: Méditation matinale"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-emerald-500/40 focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description optionnelle..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-emerald-500/40 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Icône</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-800/30">
                  {HABIT_ICONS.map((i) => (
                    <button
                      key={i}
                      onClick={() => setIcon(i)}
                      className={`w-10 h-10 rounded-lg text-xl transition-all ${
                        icon === i ? 'bg-emerald-500/30 border border-emerald-500/50' : 'bg-slate-700/50 hover:bg-slate-600/50'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Couleur</label>
                <div className="flex gap-2">
                  {HABIT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

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
                          ? 'bg-emerald-500/20 border border-emerald-500/40' 
                          : 'bg-slate-800/50 border border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-lg block">{CATEGORY_ICONS[cat]}</span>
                      <span className="text-[10px] text-slate-300">{CATEGORY_LABELS[cat]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of Day */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Moment de la journée</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_OPTIONS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimeOfDay(time)}
                      className={`p-3 rounded-xl text-sm transition-all ${
                        timeOfDay === time 
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-white' 
                          : 'bg-slate-800/50 border border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      {TIME_LABELS[time]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Fréquence</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['daily', 'weekly', 'custom'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={`p-3 rounded-xl text-sm transition-all ${
                        frequency === freq 
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-white' 
                          : 'bg-slate-800/50 border border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      {freq === 'daily' ? '📅 Quotidien' : freq === 'weekly' ? '📆 Hebdo' : '⚙️ Custom'}
                    </button>
                  ))}
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
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : habit ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

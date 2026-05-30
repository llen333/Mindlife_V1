/**
 * AddSavingsGoalModal - Formulaire d'ajout/modification d'objectif d'épargne
 * Style GlassCard comme GoalModal
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, PiggyBank, Calendar, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  icon: string;
  color: string;
  status: string;
}

interface AddSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; targetAmount: number; deadline?: string; icon: string; color: string }) => void;
  onUpdate?: (id: string, data: Partial<{ name: string; targetAmount: number; currentAmount: number; deadline?: string; icon: string; color: string }>) => void;
  onDelete?: (id: string) => void;
  onAddFunds?: (id: string, amount: number) => void;
  goal?: SavingsGoal | null;
}

const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🎁', '💰', '🏖️', '🎮'];
const GOAL_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

export default function AddSavingsGoalModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  onAddFunds,
  goal,
}: AddSavingsGoalModalProps) {
  const isEditing = !!goal;
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#10b981');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [showAddFunds, setShowAddFunds] = useState(false);
  
  // Initialiser avec les données de l'objectif si édition
  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
      setCurrentAmount(goal.currentAmount.toString());
      setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
      setIcon(goal.icon || '🎯');
      setColor(goal.color || '#10b981');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setDeadline('');
      setIcon('🎯');
      setColor('#10b981');
    }
    setAddFundsAmount('');
    setShowAddFunds(false);
  }, [goal, isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    
    const data = {
      name,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline || undefined,
      icon,
      color,
    };
    
    if (isEditing && onUpdate && goal) {
      onUpdate(goal.id, { ...data, currentAmount: parseFloat(currentAmount) || 0 });
    } else {
      onSubmit(data);
    }
    
    onClose();
  };
  
  const handleAddFunds = () => {
    if (goal && onAddFunds && addFundsAmount) {
      onAddFunds(goal.id, parseFloat(addFundsAmount));
      setAddFundsAmount('');
      setShowAddFunds(false);
    }
  };
  
  const handleDelete = () => {
    if (goal && onDelete && confirm('Supprimer cet objectif ?')) {
      onDelete(goal.id);
      onClose();
    }
  };
  
  const progress = targetAmount ? (parseFloat(currentAmount) / parseFloat(targetAmount)) * 100 : 0;
  
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

  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlay}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          style={{ zIndex: 99999 }}
          onClick={onClose}
        >
          <motion.div
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard glowColor="emerald" className="p-0 overflow-hidden">
              <div className="p-6 max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <PiggyBank className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      {isEditing ? 'Modifier' : 'Nouvel'} objectif
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                
                {/* Progress (if editing) */}
                {isEditing && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Progression</span>
                      <span className="text-lg font-bold text-white">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-emerald-400">{parseFloat(currentAmount).toFixed(0)}€</span>
                      <span className="text-slate-400">{parseFloat(targetAmount).toFixed(0)}€</span>
                    </div>
                  </div>
                )}
                
                {/* Add Funds (if editing) */}
                {isEditing && (
                  <div className="mb-4">
                    {showAddFunds ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={addFundsAmount}
                          onChange={(e) => setAddFundsAmount(e.target.value)}
                          placeholder="Montant à ajouter"
                          className="flex-1 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                        />
                        <button
                          type="button"
                          onClick={handleAddFunds}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                        >
                          Ajouter
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddFunds(false)}
                          className="px-3 py-2 bg-slate-700/50 text-slate-400 rounded-lg hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddFunds(true)}
                        className="w-full py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                      >
                        + Ajouter des fonds
                      </button>
                    )}
                  </div>
                )}
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Nom de l'objectif</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Vacances, Nouvelle voiture, Apport immo..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      required
                    />
                  </div>
                  
                  {/* Target Amount */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Montant cible (€)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white text-lg font-semibold placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">€</span>
                    </div>
                  </div>
                  
                  {/* Current Amount (if editing) */}
                  {isEditing && (
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Montant actuel (€)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={currentAmount}
                          onChange={(e) => setCurrentAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">€</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Deadline */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date cible (optionnel)
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  
                  {/* Icon Selection */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Icône</label>
                    <div className="grid grid-cols-6 gap-2">
                      {GOAL_ICONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setIcon(emoji)}
                          className={`p-2 rounded-xl border transition-all ${
                            icon === emoji
                              ? 'bg-emerald-500/20 border-emerald-500/40'
                              : 'bg-slate-800/30 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Couleur</label>
                    <div className="flex gap-2">
                      {GOAL_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-8 h-8 rounded-lg transition-all ${
                            color === c ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-slate-900' : ''
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-500 mb-2">Aperçu</p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        {icon}
                      </div>
                      <div>
                        <p className="text-white font-medium">{name || 'Mon objectif'}</p>
                        <p className="text-emerald-400 text-sm font-semibold">{parseFloat(targetAmount || '0').toFixed(2)}€</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    {isEditing && onDelete && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Target className="w-4 h-4" />
                      {isEditing ? 'Enregistrer' : 'Créer l\'objectif'}
                    </button>
                  </div>
                </form>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

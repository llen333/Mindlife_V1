/**
 * AddBillModal - Formulaire d'ajout/modification de facture récurrente
 * Style GlassCard comme GoalModal
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Repeat, Bell, FileText, Trash2, Edit3 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { RecurringBillFormData, ExpenseCategory, BillFrequency } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: string;
  nextDueDate: Date;
  provider?: string;
  autoPayEnabled: boolean;
  reminderDays: number;
  status: string;
}

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecurringBillFormData) => void;
  onUpdate?: (id: string, data: Partial<RecurringBillFormData>) => void;
  onDelete?: (id: string) => void;
  onTogglePause?: (id: string) => void;
  bill?: RecurringBill | null;
}

const FREQUENCY_OPTIONS: { value: BillFrequency; label: string }[] = [
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuelle' },
  { value: 'quarterly', label: 'Trimestrielle' },
  { value: 'yearly', label: 'Annuelle' },
];

export default function AddBillModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  onTogglePause,
  bill,
}: AddBillModalProps) {
  const isEditing = !!bill;
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('abonnements');
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [provider, setProvider] = useState('');
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  
  // Initialiser avec les données de la facture si édition
  useEffect(() => {
    if (bill) {
      setName(bill.name);
      setAmount(bill.amount.toString());
      setCategory(bill.category);
      setFrequency(bill.frequency as BillFrequency);
      setNextDueDate(new Date(bill.nextDueDate).toISOString().split('T')[0]);
      setProvider(bill.provider || '');
      setAutoPayEnabled(bill.autoPayEnabled);
      setReminderDays(bill.reminderDays);
    } else {
      setName('');
      setAmount('');
      setCategory('abonnements');
      setFrequency('monthly');
      setNextDueDate('');
      setProvider('');
      setAutoPayEnabled(false);
      setReminderDays(3);
    }
  }, [bill, isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !nextDueDate) return;
    
    const data: RecurringBillFormData = {
      name,
      amount: parseFloat(amount),
      category: category as ExpenseCategory,
      frequency,
      nextDueDate,
      provider,
      autoPayEnabled,
      reminderDays,
    };
    
    if (isEditing && onUpdate && bill) {
      onUpdate(bill.id, data);
    } else {
      onSubmit(data);
    }
    
    onClose();
  };
  
  const handleDelete = () => {
    if (bill && onDelete && confirm('Supprimer cette facture ?')) {
      onDelete(bill.id);
      onClose();
    }
  };
  
  const handleTogglePause = () => {
    if (bill && onTogglePause) {
      onTogglePause(bill.id);
      onClose();
    }
  };
  
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
            <GlassCard glowColor="amber" className="p-0 overflow-hidden">
              <div className="p-6 max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-amber-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      {isEditing ? 'Modifier' : 'Nouvelle'} facture
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Nom de la facture</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Netflix, Électricité, Loyer..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    />
                  </div>
                  
                  {/* Amount */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Montant (€)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white text-lg font-semibold placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">€</span>
                    </div>
                  </div>
                  
                  {/* Frequency */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      Fréquence
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFrequency(opt.value)}
                          className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            frequency === opt.value
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              : 'bg-slate-800/30 border-white/5 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Next Due Date */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Prochaine échéance
                    </label>
                    <input
                      type="date"
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Catégorie</label>
                    <div className="grid grid-cols-4 gap-2">
                      {EXPENSE_CATEGORIES.slice(0, 8).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                            category === cat.id
                              ? 'bg-amber-500/20 border-amber-500/40 text-white'
                              : 'bg-slate-800/30 border-white/5 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-[10px] truncate w-full text-center">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Provider */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Fournisseur (optionnel)</label>
                    <input
                      type="text"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      placeholder="Ex: EDF, Netflix, Free..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                  
                  {/* Reminder */}
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="text-sm text-white">Rappel automatique</p>
                        <p className="text-xs text-slate-400">{reminderDays} jours avant</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReminderDays(Math.max(1, reminderDays - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-white font-medium">{reminderDays}</span>
                      <button
                        type="button"
                        onClick={() => setReminderDays(reminderDays + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Auto Pay */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPayEnabled}
                      onChange={(e) => setAutoPayEnabled(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-slate-800/50 text-amber-500 focus:ring-amber-500/50"
                    />
                    <span className="text-sm text-slate-300">Paiement automatique activé</span>
                  </label>
                  
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
                    {isEditing && onTogglePause && bill && (
                      <button
                        type="button"
                        onClick={handleTogglePause}
                        className="px-4 py-2.5 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors text-sm"
                      >
                        {bill.status === 'paused' ? 'Reprendre' : 'Pause'}
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
                    >
                      {isEditing ? 'Enregistrer' : 'Ajouter la facture'}
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

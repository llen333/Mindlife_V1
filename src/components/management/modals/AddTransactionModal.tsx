/**
 * AddTransactionModal - Formulaire d'ajout/modification de transaction
 * Style GlassCard comme GoalModal
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { TransactionFormData, ExpenseCategory, IncomeCategory } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  date: Date;
  merchant?: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  onUpdate?: (id: string, data: Partial<TransactionFormData>) => void;
  onDelete?: (id: string) => void;
  transaction?: Transaction | null;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  transaction,
}: AddTransactionModalProps) {
  const isEditing = !!transaction;
  
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  
  // Initialiser avec les données de la transaction si édition
  useEffect(() => {
    if (transaction) {
      setType(transaction.type as 'expense' | 'income');
      setAmount(Math.abs(transaction.amount).toString());
      setCategory(transaction.category);
      setDescription(transaction.description);
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setMerchant(transaction.merchant || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setMerchant('');
    }
  }, [transaction, isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;
    
    const data: TransactionFormData = {
      amount: parseFloat(amount),
      type,
      category: category as ExpenseCategory | IncomeCategory,
      description,
      date,
      merchant: merchant || undefined,
    };
    
    if (isEditing && onUpdate && transaction) {
      onUpdate(transaction.id, data);
    } else {
      onSubmit(data);
    }
    
    onClose();
  };
  
  const handleDelete = () => {
    if (transaction && onDelete && confirm('Supprimer cette transaction ?')) {
      onDelete(transaction.id);
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
              <div className="p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      type === 'income' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                    }`}>
                      {type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      {isEditing ? 'Modifier' : 'Nouvelle'} transaction
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                
                {/* Type Toggle */}
                <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl mb-6">
                  <button
                    onClick={() => { setType('expense'); setCategory(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      type === 'expense'
                        ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    Dépense
                  </button>
                  <button
                    onClick={() => { setType('income'); setCategory(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      type === 'income'
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Recette
                  </button>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Amount */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Montant (€)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white text-lg font-semibold placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">€</span>
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Catégorie</label>
                    <div className="grid grid-cols-4 gap-2">
                      {categories.map((cat) => (
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
                  
                  {/* Description */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Titre / Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Courses Carrefour"
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    />
                  </div>
                  
                  {/* Merchant */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Commerçant (optionnel)</label>
                    <input
                      type="text"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      placeholder="Ex: Carrefour, Amazon..."
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                  
                  {/* Date */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    />
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
                      className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        type === 'income'
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-rose-500 text-white hover:bg-rose-600'
                      }`}
                    >
                      {isEditing ? 'Enregistrer' : type === 'income' ? 'Ajouter la recette' : 'Ajouter la dépense'}
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

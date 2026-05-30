/**
 * DailyExpenses - Suivi des dépenses quotidiennes
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  ChevronDown,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transaction, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_MAP, PERIOD_OPTIONS } from '../constants';

interface DailyExpensesProps {
  transactions: Transaction[];
  onAddExpense?: () => void;
  onEditTransaction?: (id: string) => void;
  onDeleteTransaction?: (id: string) => void;
}

export default function DailyExpenses({
  transactions,
  onAddExpense,
  onEditTransaction,
  onDeleteTransaction,
}: DailyExpensesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Animation d'entrée
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);
  
  // Filtrer les transactions
  const filteredTransactions = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    
    // Filtre période
    const period = PERIOD_OPTIONS.find(p => p.id === selectedPeriod);
    if (period) {
      const txDate = new Date(t.date);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - period.days);
      if (txDate < cutoff) return false;
    }
    
    // Filtre catégorie
    if (selectedCategory && t.category !== selectedCategory) return false;
    
    // Filtre recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(query) ||
        t.merchant?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Grouper par date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = new Date(tx.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);
  
  // Calculer le total
  const totalExpenses = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const formatDate = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    
    return dateStr;
  };
  
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            Dépenses
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Total: <span className="text-rose-400 font-semibold">{totalExpenses.toFixed(2)}€</span>
          </p>
        </div>
        <button
          onClick={onAddExpense}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>
      
      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none transition-colors"
          />
        </div>
        
        {/* Period Filter */}
        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:border-amber-500/50 focus:outline-none transition-colors cursor-pointer"
          >
            {PERIOD_OPTIONS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        
        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory || null)}
            className="appearance-none px-4 py-2 pr-10 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:border-amber-500/50 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">Toutes catégories</option>
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {EXPENSE_CATEGORIES.slice(0, 4).map(cat => {
          const catTotal = filteredTransactions
            .filter(t => t.category === cat.id)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
          
          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={cn(
                "p-3 rounded-xl border cursor-pointer transition-all",
                selectedCategory === cat.id
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-slate-800/30 border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{cat.icon}</span>
                <span className="text-sm text-slate-400">{cat.name}</span>
              </div>
              <p className="text-lg font-semibold text-white mt-1">{catTotal.toFixed(2)}€</p>
            </div>
          );
        })}
      </div>
      
      {/* Transactions List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
        {Object.entries(groupedTransactions).map(([date, txs]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-slate-400 mb-2 sticky top-0 bg-[#0a0f1a] py-1 z-10">
              {formatDate(date)}
            </h3>
            <div className="space-y-2">
              {txs.map((tx, index) => {
                const categoryInfo = EXPENSE_CATEGORY_MAP[tx.category as ExpenseCategory];
                
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${categoryInfo?.color}20` }}>
                      {categoryInfo?.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{tx.description}</p>
                      <p className="text-xs text-slate-400">
                        {categoryInfo?.name}
                        {tx.merchant && ` • ${tx.merchant}`}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-rose-400">-{Math.abs(tx.amount).toFixed(2)}€</p>
                      <p className="text-xs text-slate-500">
                        {new Date(tx.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => onEditTransaction?.(tx.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction?.(tx.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Aucune dépense trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}

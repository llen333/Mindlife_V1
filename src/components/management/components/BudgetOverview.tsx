/**
 * BudgetOverview - Vue d'ensemble du budget mensuel
 * Style glassmorphisme avec animations
 */

'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '../types';
import { EXPENSE_CATEGORY_MAP, THEME_COLORS } from '../constants';

interface BudgetOverviewProps {
  stats: DashboardStats;
  onSeeDetails?: () => void;
}

export default function BudgetOverview({ stats, onSeeDetails }: BudgetOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Animation d'entrée
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
    
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.stat-card');
      gsap.fromTo(cards,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);
  
  const { currentMonth, comparison, topCategories } = stats;
  const savingsPercentage = Math.round((currentMonth.savings / currentMonth.income) * 100);
  
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Main Stats Cards */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="stat-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-5 backdrop-blur-xl transition-all hover:border-emerald-500/40">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                comparison.incomeChange >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              )}>
                {comparison.incomeChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(comparison.incomeChange)}%
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Revenus</p>
            <p className="text-2xl font-bold text-white">{currentMonth.income.toLocaleString('fr-FR')} €</p>
          </div>
        </div>
        
        {/* Expenses Card */}
        <div className="stat-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 p-5 backdrop-blur-xl transition-all hover:border-rose-500/40">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-400" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                comparison.expenseChange <= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              )}>
                {comparison.expenseChange <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                {Math.abs(comparison.expenseChange)}%
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Dépenses</p>
            <p className="text-2xl font-bold text-white">{currentMonth.expenses.toLocaleString('fr-FR')} €</p>
          </div>
        </div>
        
        {/* Balance Card */}
        <div className="stat-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 p-5 backdrop-blur-xl transition-all hover:border-cyan-500/40">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-cyan-400" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                currentMonth.balance >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              )}>
                {currentMonth.balance >= 0 ? 'Positif' : 'Négatif'}
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Solde</p>
            <p className="text-2xl font-bold text-white">
              {currentMonth.balance >= 0 ? '+' : ''}{currentMonth.balance.toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>
        
        {/* Savings Card */}
        <div className="stat-card group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-5 backdrop-blur-xl transition-all hover:border-amber-500/40">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-amber-400" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                comparison.savingsChange >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              )}>
                {comparison.savingsChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(comparison.savingsChange)}%
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Épargne</p>
            <p className="text-2xl font-bold text-white">{savingsPercentage}%</p>
          </div>
        </div>
      </div>
      
      {/* Progress Bar & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Progress */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Progression du budget</h3>
          
          <div className="space-y-4">
            {/* Main Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Dépensé</span>
                <span className="text-white font-medium">
                  {Math.round((currentMonth.expenses / currentMonth.income) * 100)}%
                </span>
              </div>
              <div ref={progressRef} className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((currentMonth.expenses / currentMonth.income) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
            
            {/* Budget Details */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{currentMonth.income.toLocaleString('fr-FR')}€</p>
                <p className="text-xs text-slate-400">Budget total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-rose-400">{currentMonth.expenses.toLocaleString('fr-FR')}€</p>
                <p className="text-xs text-slate-400">Dépensé</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{currentMonth.balance.toLocaleString('fr-FR')}€</p>
                <p className="text-xs text-slate-400">Restant</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Categories */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top catégories</h3>
            <button 
              onClick={onSeeDetails}
              className="text-amber-400 text-sm hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {topCategories.map((cat, index) => {
              const categoryInfo = EXPENSE_CATEGORY_MAP[cat.category];
              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${categoryInfo?.color}20` }}>
                    {categoryInfo?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white">{categoryInfo?.name}</span>
                      <span className="text-sm text-slate-400">{cat.amount}€</span>
                    </div>
                    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: categoryInfo?.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

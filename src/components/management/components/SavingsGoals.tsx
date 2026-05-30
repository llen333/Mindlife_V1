/**
 * SavingsGoals - Objectifs d'épargne
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle,
  Pause,
  TrendingUp,
  Edit2,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SavingsGoal } from '../types';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal?: () => void;
  onEditGoal?: (id: string) => void;
  onDeleteGoal?: (id: string) => void;
  onContribute?: (id: string, amount: number) => void;
}

export default function SavingsGoals({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onContribute,
}: SavingsGoalsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  
  // Animation d'entrée
  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.goal-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);
  
  // Stats
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const pausedGoals = goals.filter(g => g.status === 'paused');
  
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  
  const getProgressPercentage = (goal: SavingsGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };
  
  const getDaysRemaining = (deadline?: Date) => {
    if (!deadline) return null;
    const now = new Date();
    const end = new Date(deadline);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  const handleContribute = (goalId: string) => {
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) return;
    onContribute?.(goalId, amount);
    setContributeAmount('');
    setShowContribute(null);
  };
  
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            Objectifs d'épargne
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {activeGoals.length} objectif{activeGoals.length > 1 ? 's' : ''} en cours • 
            <span className="text-amber-400 font-semibold ml-1">{totalSaved.toFixed(0)}€ / {totalTarget.toFixed(0)}€</span>
          </p>
        </div>
        <button
          onClick={onAddGoal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvel objectif
        </button>
      </div>
      
      {/* Overall Progress */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Progression globale</h3>
            <p className="text-sm text-slate-400">Tous vos objectifs réunis</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{overallProgress.toFixed(0)}%</p>
            <p className="text-xs text-slate-400">atteint</p>
          </div>
        </div>
        
        <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        
        <div className="flex justify-between mt-3 text-sm">
          <span className="text-slate-400">{totalSaved.toFixed(0)}€ épargnés</span>
          <span className="text-slate-400">{(totalTarget - totalSaved).toFixed(0)}€ restants</span>
        </div>
      </div>
      
      {/* Active Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeGoals.map((goal) => {
          const progress = getProgressPercentage(goal);
          const daysRemaining = getDaysRemaining(goal.deadline);
          
          return (
            <motion.div
              key={goal.id}
              layout
              onClick={() => onEditGoal?.(goal.id)}
              className="goal-card group relative overflow-hidden rounded-xl bg-slate-800/30 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer"
            >
              {/* Background Glow */}
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: `radial-gradient(circle at top left, ${goal.color}30, transparent 70%)` }}
              />
              
              <div className="relative p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      {goal.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{goal.name}</h4>
                      {daysRemaining !== null && (
                        <p className={cn(
                          "text-xs",
                          daysRemaining < 30 ? "text-amber-400" : "text-slate-400"
                        )}>
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {daysRemaining > 0 ? `${daysRemaining}j restants` : 'Échéance dépassée'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{goal.currentAmount.toFixed(0)}€</span>
                    <span className="text-white font-medium">{goal.targetAmount.toFixed(0)}€</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{progress.toFixed(0)}% atteint</p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowContribute(showContribute === goal.id ? null : goal.id)}
                    className="flex-1 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Ajouter
                  </button>
                </div>
                
                {/* Contribute Form */}
                {showContribute === goal.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-white/10"
                  >
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={contributeAmount}
                        onChange={(e) => setContributeAmount(e.target.value)}
                        placeholder="Montant"
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-700/50 border border-white/10 text-white text-sm focus:border-amber-500/50 focus:outline-none"
                      />
                      <button
                        onClick={() => handleContribute(goal.id)}
                        className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                      >
                        Valider
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-slate-400 flex items-center gap-2 hover:text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            {completedGoals.length} objectif{completedGoals.length > 1 ? 's' : ''} atteint{completedGoals.length > 1 ? 's' : ''}
            <span className="text-emerald-400">🎉</span>
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
              >
                <span className="text-xl">{goal.icon}</span>
                <div>
                  <p className="text-sm text-white line-through">{goal.name}</p>
                  <p className="text-xs text-emerald-400">{goal.targetAmount.toFixed(0)}€ épargnés</p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
      
      {/* Paused Goals */}
      {pausedGoals.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-slate-400 flex items-center gap-2 hover:text-slate-300">
            <Pause className="w-4 h-4" />
            {pausedGoals.length} objectif{pausedGoals.length > 1 ? 's' : ''} en pause
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 opacity-50">
            {pausedGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/20 border border-white/5"
              >
                <span className="text-xl">{goal.icon}</span>
                <div>
                  <p className="text-sm text-slate-400">{goal.name}</p>
                  <p className="text-xs text-slate-500">{goal.currentAmount.toFixed(0)}€ / {goal.targetAmount.toFixed(0)}€</p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * RecurringBills - Gestion des factures récurrentes
 * Style glassmorphisme avec calendrier
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Bell,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Pause,
  Play,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecurringBill } from '../types';
import { EXPENSE_CATEGORY_MAP, FREQUENCY_LABELS } from '../constants';

interface RecurringBillsProps {
  bills: RecurringBill[];
  onAddBill?: () => void;
  onEditBill?: (id: string) => void;
  onDeleteBill?: (id: string) => void;
  onTogglePause?: (id: string) => void;
}

export default function RecurringBills({
  bills,
  onAddBill,
  onEditBill,
  onDeleteBill,
  onTogglePause,
}: RecurringBillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Animation d'entrée
  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('.bill-item');
      gsap.fromTo(items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [bills]);
  
  // Grouper par statut
  const activeBills = bills.filter(b => b.status === 'active');
  const pausedBills = bills.filter(b => b.status === 'paused');
  
  // Calculer le total mensuel
  const monthlyTotal = activeBills.reduce((sum, bill) => {
    const amount = bill.frequency === 'yearly' ? bill.amount / 12 :
                   bill.frequency === 'quarterly' ? bill.amount / 3 :
                   bill.frequency === 'weekly' ? bill.amount * 4.33 :
                   bill.amount;
    return sum + amount;
  }, 0);
  
  // Prochaines factures (triées par date)
  const upcomingBills = [...activeBills]
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, 5);
  
  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const due = new Date(date);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-red-400';
    if (days <= 3) return 'text-orange-400';
    if (days <= 7) return 'text-amber-400';
    return 'text-slate-400';
  };
  
  const getUrgencyBg = (days: number) => {
    if (days < 0) return 'bg-red-500/10 border-red-500/30';
    if (days <= 3) return 'bg-orange-500/10 border-orange-500/30';
    if (days <= 7) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-slate-800/50 border-white/10';
  };
  
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Factures récurrentes
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Total mensuel: <span className="text-amber-400 font-semibold">{monthlyTotal.toFixed(2)}€</span>
          </p>
        </div>
        <button
          onClick={onAddBill}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>
      
      {/* Upcoming Bills Timeline */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Prochaines échéances
        </h3>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/50 to-transparent" />
          
          <div className="space-y-3">
            {upcomingBills.map((bill, index) => {
              const daysUntil = getDaysUntil(bill.nextDueDate);
              const categoryInfo = EXPENSE_CATEGORY_MAP[bill.category];
              
              return (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "bill-item relative flex items-center gap-4 p-3 rounded-xl border transition-all",
                    getUrgencyBg(daysUntil)
                  )}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-3 w-2 h-2 rounded-full z-10",
                    daysUntil <= 3 ? "bg-orange-400" : "bg-amber-400"
                  )} />
                  
                  {/* Category icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${categoryInfo?.color}20` }}>
                    {categoryInfo?.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{bill.name}</p>
                      {bill.autoPayEnabled && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">Auto</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(bill.nextDueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {' • '}
                      {FREQUENCY_LABELS[bill.frequency]}
                    </p>
                  </div>
                  
                  {/* Amount & Days */}
                  <div className="text-right">
                    <p className="font-semibold text-white">{bill.amount.toFixed(2)}€</p>
                    <p className={cn("text-xs", getUrgencyColor(daysUntil))}>
                      {daysUntil < 0 
                        ? `En retard de ${Math.abs(daysUntil)}j`
                        : daysUntil === 0 
                          ? "Aujourd'hui"
                          : `Dans ${daysUntil}j`
                      }
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === bill.id ? null : bill.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === bill.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -5 }}
                          className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20"
                        >
                          <button
                            onClick={() => { onEditBill?.(bill.id); setActiveDropdown(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                          >
                            <Edit2 className="w-4 h-4" /> Modifier
                          </button>
                          <button
                            onClick={() => { onTogglePause?.(bill.id); setActiveDropdown(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                          >
                            {bill.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            {bill.status === 'paused' ? 'Reprendre' : 'Pause'}
                          </button>
                          {bill.website && (
                            <a
                              href={bill.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                            >
                              <ExternalLink className="w-4 h-4" /> Accéder
                            </a>
                          )}
                          <button
                            onClick={() => { onDeleteBill?.(bill.id); setActiveDropdown(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* All Bills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeBills.map((bill) => {
          const categoryInfo = EXPENSE_CATEGORY_MAP[bill.category];
          
          return (
            <div
              key={bill.id}
              onClick={() => onEditBill?.(bill.id)}
              className="group relative overflow-hidden rounded-xl bg-slate-800/30 border border-white/5 p-4 hover:border-amber-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${categoryInfo?.color}20` }}>
                    {categoryInfo?.icon}
                  </div>
                  <div>
                    <p className="font-medium text-white">{bill.name}</p>
                    <p className="text-xs text-slate-400">{bill.provider}</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-white">{bill.amount.toFixed(2)}€</span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>{FREQUENCY_LABELS[bill.frequency]}</span>
                <span>Le {new Date(bill.nextDueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Paused Bills */}
      {pausedBills.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Pause className="w-4 h-4" />
            En pause
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pausedBills.map((bill) => {
              const categoryInfo = EXPENSE_CATEGORY_MAP[bill.category];
              
              return (
                <div
                  key={bill.id}
                  className="relative overflow-hidden rounded-xl bg-slate-800/20 border border-white/5 p-4 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${categoryInfo?.color}10` }}>
                      {categoryInfo?.icon}
                    </div>
                    <div>
                      <p className="font-medium text-slate-300">{bill.name}</p>
                      <p className="text-xs text-slate-500">{bill.amount.toFixed(2)}€ • En pause</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ShoppingTracker - Suivi des courses et listes
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Check,
  Plus,
  Trash2,
  ChefHat,
  DollarSign,
  ListChecks,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ShoppingList, ShoppingItem } from '../types';

interface ShoppingTrackerProps {
  lists: ShoppingList[];
  onToggleItem?: (listId: string, itemId: string) => void;
  onAddList?: () => void;
  onAddItem?: (listId: string, item: Partial<ShoppingItem>) => void;
}

export default function ShoppingTracker({
  lists,
  onToggleItem,
  onAddList,
  onAddItem,
}: ShoppingTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeList, setActiveList] = useState<ShoppingList | null>(lists[0] || null);
  const [newItemName, setNewItemName] = useState('');
  
  // Animation d'entrée
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);
  
  // Calculer les stats de la liste active
  const listStats = activeList ? {
    total: activeList.items.length,
    checked: activeList.items.filter(i => i.isChecked).length,
    estimatedTotal: activeList.items.reduce((sum, i) => sum + i.estimatedPrice, 0),
    actualTotal: activeList.items.filter(i => i.isChecked).reduce((sum, i) => sum + (i.actualPrice || i.estimatedPrice), 0),
  } : null;
  
  const progressPercentage = listStats ? (listStats.checked / listStats.total) * 100 : 0;
  
  const handleAddItem = () => {
    if (!newItemName.trim() || !activeList) return;
    onAddItem?.(activeList.id, {
      name: newItemName.trim(),
      quantity: 1,
      estimatedPrice: 0,
      category: 'Divers',
      isChecked: false,
    });
    setNewItemName('');
  };
  
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            Suivi Courses
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Gérez vos listes de courses et budgets
          </p>
        </div>
        <button
          onClick={onAddList}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvelle liste
        </button>
      </div>
      
      {/* Lists Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveList(list)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeList?.id === list.id
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                : "bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50"
            )}
          >
            {list.name}
          </button>
        ))}
      </div>
      
      {lists.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400 mb-4">Aucune liste de courses</p>
          <button
            onClick={onAddList}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Créer une liste
          </button>
        </div>
      )}
      
      {activeList && listStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress Bar */}
            <div className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">Progression</span>
                <span className="text-sm text-white font-medium">{listStats.checked}/{listStats.total} articles</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            {/* Add Item */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Ajouter un article..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none transition-colors"
              />
              <button
                onClick={handleAddItem}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {/* Items Grid */}
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {activeList.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      item.isChecked
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-slate-800/30 border-white/5 hover:border-white/10"
                    )}
                  >
                    <button
                      onClick={() => onToggleItem?.(activeList.id, item.id)}
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                        item.isChecked
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700/50 border border-white/20"
                      )}
                    >
                      {item.isChecked && <Check className="w-4 h-4" />}
                    </button>
                    
                    <div className="flex-1">
                      <p className={cn(
                        "font-medium transition-all",
                        item.isChecked ? "text-slate-400 line-through" : "text-white"
                      )}>
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} {item.unit} • {item.category}
                      </p>
                    </div>
                    
                    <span className="text-sm font-medium text-slate-300">
                      {item.estimatedPrice.toFixed(2)}€
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Stats Sidebar */}
          <div className="space-y-4">
            {/* Budget Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Budget</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{activeList.budget.toFixed(2)}€</p>
              <p className="text-xs text-slate-400">Budget alloué</p>
              
              <div className="mt-3 pt-3 border-t border-amber-500/20">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Estimé</span>
                  <span className="text-white font-medium">{listStats.estimatedTotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-400">Restant</span>
                  <span className={cn(
                    "font-medium",
                    activeList.budget - listStats.estimatedTotal >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {(activeList.budget - listStats.estimatedTotal).toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-white/10 p-4">
              <h4 className="text-sm font-medium text-white mb-3">Actions rapides</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Suggestions AI
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                  <ChefHat className="w-4 h-4 text-emerald-400" />
                  Générer depuis repas
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Programmer
                </button>
              </div>
            </div>
            
            {/* Category Summary */}
            <div className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-white/10 p-4">
              <h4 className="text-sm font-medium text-white mb-3">Par catégorie</h4>
              <div className="space-y-2">
                {Array.from(new Set(activeList.items.map(i => i.category))).map(cat => {
                  const items = activeList.items.filter(i => i.category === cat);
                  const total = items.reduce((sum, i) => sum + i.estimatedPrice, 0);
                  return (
                    <div key={cat} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{cat}</span>
                      <span className="text-white">{items.length} • {total.toFixed(2)}€</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

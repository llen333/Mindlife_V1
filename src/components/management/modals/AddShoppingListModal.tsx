/**
 * AddShoppingListModal - Formulaire d'ajout de liste de courses
 * Style GlassCard comme GoalModal
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface ShoppingItem {
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: string;
}

interface AddShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; budget: number; items: ShoppingItem[] }) => void;
}

const ITEM_CATEGORIES = [
  { id: 'fruits-legumes', name: 'Fruits & Légumes', icon: '🥬' },
  { id: 'viandes', name: 'Viandes', icon: '🥩' },
  { id: 'produits-laitiers', name: 'Laitiers', icon: '🧀' },
  { id: 'epicerie', name: 'Épicerie', icon: '🥫' },
  { id: 'boissons', name: 'Boissons', icon: '🥤' },
  { id: 'hygiene', name: 'Hygiène', icon: '🧴' },
  { id: 'menager', name: 'Ménager', icon: '🧹' },
  { id: 'autre', name: 'Autre', icon: '📦' },
];

export default function AddShoppingListModal({ isOpen, onClose, onSubmit }: AddShoppingListModalProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  
  // New item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('epicerie');
  
  const addItem = () => {
    if (!newItemName) return;
    
    setItems([...items, {
      name: newItemName,
      quantity: newItemQuantity,
      estimatedPrice: parseFloat(newItemPrice) || 0,
      category: newItemCategory,
    }]);
    
    // Reset
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemPrice('');
    setNewItemCategory('epicerie');
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const totalEstimated = items.reduce((sum, item) => sum + (item.estimatedPrice * item.quantity), 0);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    onSubmit({
      name,
      budget: parseFloat(budget) || 0,
      items,
    });
    
    // Reset
    setName('');
    setBudget('');
    setItems([]);
    onClose();
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
            className="w-full max-w-lg"
          >
            <GlassCard glowColor="cyan" className="p-0 overflow-hidden">
              <div className="p-6 max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Nouvelle liste</h2>
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
                    <label className="block text-sm text-slate-400 mb-2">Nom de la liste</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Courses semaine, Anniversaire..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      required
                    />
                  </div>
                  
                  {/* Budget */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Budget prévu (€)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">€</span>
                    </div>
                  </div>
                  
                  {/* Add Item Section */}
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5 space-y-3">
                    <h3 className="text-sm font-medium text-white">Ajouter un article</h3>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Article"
                        className="flex-1 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                      />
                      <input
                        type="number"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                        className="w-16 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm text-center focus:outline-none focus:border-cyan-500/50"
                        min="1"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        placeholder="Prix"
                        className="w-24 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      >
                        {ITEM_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addItem}
                        className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter
                      </button>
                    </div>
                  </div>
                  
                  {/* Items List */}
                  {items.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Articles ({items.length})</span>
                        <span className="text-cyan-400 font-medium">{totalEstimated.toFixed(2)}€ estimé</span>
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {items.map((item, index) => {
                          const cat = ITEM_CATEGORIES.find(c => c.id === item.category);
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-white/5"
                            >
                              <span className="text-lg">{cat?.icon || '📦'}</span>
                              <span className="flex-1 text-sm text-white">{item.name}</span>
                              <span className="text-xs text-slate-400">x{item.quantity}</span>
                              <span className="text-sm text-white font-medium">{(item.estimatedPrice * item.quantity).toFixed(2)}€</span>
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-600 transition-colors"
                  >
                    Créer la liste
                  </button>
                </form>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * ManualMealModal Component
 * Popup premium glassmorphic de saisie manuelle de repas
 */

import { useState } from 'react';
import { X, Calendar, Plus, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManualMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mealData: {
    name: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => Promise<void>;
}

export function ManualMealModal({ isOpen, onClose, onSave }: ManualMealModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom du repas est requis.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await onSave({
        name,
        type,
        date,
        calories: calories ? parseFloat(calories) : 0,
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fat: fat ? parseFloat(fat) : 0,
      });
      // Reset form
      setName('');
      setType('lunch');
      setDate(new Date().toISOString().split('T')[0]);
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      onClose();
    } catch (err) {
      console.error('Error saving manual meal:', err);
      setError('Erreur lors de la sauvegarde du repas.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-lg glass-panel rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300"
        style={{
          background: 'rgba(10, 20, 15, 0.85)',
          backdropFilter: 'blur(50px)',
          border: '1px solid rgba(17, 212, 115, 0.2)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(17, 212, 115, 0.05)',
        }}
      >
        {/* Glow effect at top */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Plus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white italic tracking-tight">Saisie Manuelle</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ajouter un repas au journal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nom du Repas */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Nom du repas</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Poulet grillé et riz basmati"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all placeholder:text-slate-600 font-medium"
            />
          </div>

          {/* Type & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Type de repas</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all cursor-pointer font-medium"
              >
                <option value="breakfast" className="bg-[#0a140f] text-slate-200">Petit-Déjeuner</option>
                <option value="lunch" className="bg-[#0a140f] text-slate-200">Déjeuner</option>
                <option value="dinner" className="bg-[#0a140f] text-slate-200">Dîner</option>
                <option value="snack" className="bg-[#0a140f] text-slate-200">Collation / Snack</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date
              </label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-medium"
              />
            </div>
          </div>

          {/* Calories & Macros Header */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valeurs Nutritionnelles</span>
          </div>

          {/* Energy & Macros Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Calories */}
            <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
              <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Calories</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-white font-bold text-lg focus:outline-none placeholder:text-slate-700"
                />
                <span className="absolute right-0 bottom-1 text-[9px] font-black text-slate-500 uppercase">kcal</span>
              </div>
            </div>

            {/* Protein */}
            <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
              <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Protéines</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-white font-bold text-lg focus:outline-none placeholder:text-slate-700"
                />
                <span className="absolute right-0 bottom-1 text-[9px] font-black text-slate-500 uppercase">g</span>
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
              <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Glucides</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-white font-bold text-lg focus:outline-none placeholder:text-slate-700"
                />
                <span className="absolute right-0 bottom-1 text-[9px] font-black text-slate-500 uppercase">g</span>
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
              <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Lipides</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-white font-bold text-lg focus:outline-none placeholder:text-slate-700"
                />
                <span className="absolute right-0 bottom-1 text-[9px] font-black text-slate-500 uppercase">g</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-white/10"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#050706] text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
              style={{ boxShadow: '0 10px 25px -5px rgba(17,212,115,0.4)' }}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-[#050706] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#050706]" />
              )}
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * DailyTracking Component
 * Suivi quotidien en direct et graphique historique de 7 jours
 */

import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Plus, Flame, Sparkles, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Meal, NutritionProfile } from '../types';

interface DailyTrackingProps {
  meals: Meal[];
  nutritionProfile: NutritionProfile | null;
  onOpenManualEntry: () => void;
  onDeleteMeal?: (id: string) => void;
}

export function DailyTracking({
  meals,
  nutritionProfile,
  onOpenManualEntry,
  onDeleteMeal
}: DailyTrackingProps) {
  // Target values with secure defaults
  const target = {
    calories: nutritionProfile?.targetCalories || 2200,
    protein: nutritionProfile?.protein || 150,
    carbs: nutritionProfile?.carbs || 220,
    fat: nutritionProfile?.fat || 70,
  };

  // 1. Calculate today's values
  const todayStr = new Date().toDateString();
  const todayMeals = meals.filter(
    (m) => new Date(m.date).toDateString() === todayStr
  );

  const consumed = todayMeals.reduce(
    (acc, m) => {
      acc.calories += m.calories || 0;
      acc.protein += m.protein || 0;
      acc.carbs += m.carbs || 0;
      acc.fat += m.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calPercent = Math.min(Math.round((consumed.calories / target.calories) * 100), 100);
  const protPercent = Math.min(Math.round((consumed.protein / target.protein) * 100), 100);
  const carbsPercent = Math.min(Math.round((consumed.carbs / target.carbs) * 100), 100);
  const fatPercent = Math.min(Math.round((consumed.fat / target.fat) * 100), 100);

  const calRemaining = target.calories - consumed.calories;

  // 2. Generate last 7 days chart data dynamically
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // From 6 days ago to today
    
    const dayStr = d.toDateString();
    const dayMeals = meals.filter(
      (m) => new Date(m.date).toDateString() === dayStr
    );
    
    const dayCalories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    
    return {
      name: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3),
      Consommé: Math.round(dayCalories),
      Objectif: Math.round(target.calories),
      dateStr: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    };
  });

  return (
    <section className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Col 1: Current Day Live Gauge & Details */}
      <div 
        className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between border border-white/10 relative overflow-hidden"
        style={{ background: 'rgba(10, 20, 15, 0.75)' }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-0.5">
                Bilan du Jour
              </h3>
              <p className="text-lg font-bold text-white italic tracking-tight">Suivi Quotidien</p>
            </div>
            
            <button
              onClick={onOpenManualEntry}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-[#050706] border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Saisir repas
            </button>
          </div>

          {/* Calorie Stats & Progress Ring */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle 
                  className="text-white/5" 
                  cx="18" 
                  cy="18" 
                  fill="none" 
                  r="16" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                />
                {/* Progress Ring */}
                <circle 
                  className="text-emerald-500 transition-all duration-500" 
                  cx="18" 
                  cy="18" 
                  fill="none" 
                  r="16" 
                  stroke="currentColor" 
                  strokeDasharray={`${calPercent} 100`} 
                  strokeLinecap="round" 
                  strokeWidth="3" 
                  style={{ filter: 'drop-shadow(0 0 4px rgba(17,212,115,0.4))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ratio</span>
                <span className="text-lg font-black text-white italic">{calPercent}%</span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white italic tracking-tighter">
                  {consumed.calories}
                </span>
                <span className="text-slate-400 text-xs font-medium">/ {target.calories} kcal</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                {calRemaining >= 0 ? (
                  <>Il reste <span className="text-emerald-400 font-bold">{Math.round(calRemaining)} kcal</span></>
                ) : (
                  <>Objectif dépassé de <span className="text-amber-500 font-bold">{Math.round(Math.abs(calRemaining))} kcal</span></>
                )}
              </p>
            </div>
          </div>

          {/* Macros Detailed Bars */}
          <div className="space-y-3.5">
            {/* Protein */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Protéines</span>
                <span className="text-white font-mono">{consumed.protein}g / {target.protein}g</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${protPercent}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Glucides</span>
                <span className="text-white font-mono">{consumed.carbs}g / {target.carbs}g</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                  className="h-full bg-amber-500/70 rounded-full transition-all duration-500"
                  style={{ width: `${carbsPercent}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Lipides</span>
                <span className="text-white font-mono">{consumed.fat}g / {target.fat}g</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                  className="h-full bg-violet-500/70 rounded-full transition-all duration-500"
                  style={{ width: `${fatPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick reminder text */}
        <div className="mt-5 text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-3">
          Synchronisé avec Zustand & SQLite en temps réel.
        </div>
      </div>

      {/* Col 2: Recharts 7-Day Line/Area Graph */}
      <div 
        className="glass-panel p-6 rounded-[2rem] border border-white/10 flex flex-col justify-between lg:col-span-2 relative overflow-hidden"
        style={{ background: 'rgba(10, 20, 15, 0.75)' }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-0.5">
                Statistiques Périodiques
              </h3>
              <p className="text-lg font-bold text-white italic tracking-tight">Historique des 7 Derniers Jours</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Consommation réelle vs Objectif</span>
            </div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorConsommé" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(5, 10, 7, 0.95)',
                    border: '1px solid rgba(17, 212, 115, 0.3)',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#10b981' }}
                  labelStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', opacity: 0.6 }}
                />
                <ReferenceLine 
                  y={target.calories} 
                  stroke="rgba(255,255,255,0.4)" 
                  strokeDasharray="4 4"
                  label={{ 
                    value: `Target: ${target.calories} kcal`, 
                    fill: 'rgba(255,255,255,0.6)', 
                    fontSize: 9, 
                    fontWeight: 'black',
                    position: 'top' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="Consommé" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorConsommé)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small legend/summary of the week */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold border-t border-white/5 pt-3 mt-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Moyenne hebdo: {Math.round(chartData.reduce((acc, day) => acc + day.Consommé, 0) / 7)} kcal/j</span>
          </div>
          <span>Objectif profil: {target.calories} kcal/j</span>
        </div>
      </div>
    </section>
  );
}

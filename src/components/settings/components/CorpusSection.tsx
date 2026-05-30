'use client';

import {
  Ruler,
  Weight,
  Scale,
  Activity,
  Zap,
  Dumbbell,
  Target,
  Flame,
  Trophy,
  Medal,
  Crown,
  PersonStanding,
  Bike,
  Waves,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { genderOptions, mainGoalOptions, activityLevelOptions, sportLevelOptions, sportOptions } from '@/lib/constants/settings-options';
import { ProfileFormData, CalculatedMetrics, ImcCategory } from '../types';

interface CorpusSectionProps {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  calculatedMetrics: CalculatedMetrics;
  expanded: boolean;
}

// Get IMC category helper
function getImcCategory(imc: number | null): ImcCategory {
  if (!imc) return { label: 'Non calculé', color: 'text-slate-400' };
  if (imc < 18.5) return { label: 'Insuffisance pondérale', color: 'text-blue-400' };
  if (imc < 25) return { label: 'Poids normal', color: 'text-green-400' };
  if (imc < 30) return { label: 'Surpoids', color: 'text-yellow-400' };
  if (imc < 35) return { label: 'Obésité modérée', color: 'text-orange-400' };
  return { label: 'Obésité sévère', color: 'text-red-400' };
}

export function CorpusSection({ formData, setFormData, calculatedMetrics, expanded }: CorpusSectionProps) {
  if (!expanded) return null;

  const imcCategory = getImcCategory(calculatedMetrics.imc);

  return (
    <div className="overflow-hidden animate-expand">
      <div className="px-6 pb-8 space-y-8">
        {/* PHYSIQUE */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold uppercase tracking-wide text-white/80">Physique</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
          </div>

          {/* Physique Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Poids Card */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(251, 146, 60, 0.15)',
              }}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Weight className="w-5 h-5 text-amber-400/60" />
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Poids (kg)</label>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full bg-transparent border-none text-white text-3xl font-black focus:outline-none placeholder:text-white/20"
                  placeholder="75.5"
                />
              </div>
            </div>

            {/* Taille Card */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(251, 146, 60, 0.15)',
              }}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Ruler className="w-5 h-5 text-amber-400/60" />
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Taille (cm)</label>
                </div>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full bg-transparent border-none text-white text-3xl font-black focus:outline-none placeholder:text-white/20"
                  placeholder="175"
                />
              </div>
            </div>

            {/* Genre Card */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(251, 146, 60, 0.15)',
              }}
            >
              <div className="p-4">
                <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-3">Genre</label>
                <div className="grid grid-cols-3 gap-2">
                  {genderOptions.map((opt) => {
                    const IconComponent = opt.iconA;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setFormData({ ...formData, gender: opt.value })}
                        className={cn(
                          "py-3 rounded-xl border text-center transition-all",
                          formData.gender === opt.value
                            ? "border-amber-500/40 bg-amber-500/10"
                            : "border-white/10 hover:border-amber-500/30"
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "w-6 h-6 mx-auto mb-1 transition-all",
                            formData.gender === opt.value ? "text-amber-400" : "text-white/40"
                          )}
                        />
                        <p className="text-[10px] font-bold">{opt.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Calculated Metrics Cards */}
          {calculatedMetrics.imc && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 animate-scale-in">
                <div className="absolute top-3 right-3">
                  <Scale className="w-5 h-5 text-blue-400/50" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">IMC</p>
                <p className="text-4xl font-black text-white">{calculatedMetrics.imc?.toFixed(1)}</p>
                <p className={cn("text-xs mt-2 font-medium", imcCategory.color)}>{imcCategory.label}</p>
              </div>

              <div
                className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 animate-scale-in"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="absolute top-3 right-3">
                  <Activity className="w-5 h-5 text-green-400/50" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">BMR</p>
                <p className="text-4xl font-black text-white">{calculatedMetrics.bmr}</p>
                <p className="text-xs mt-2 text-white/40">kcal/jour</p>
              </div>

              <div
                className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 animate-scale-in"
                style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.15)', animationDelay: '0.2s' }}
              >
                <div className="absolute top-3 right-3">
                  <Zap className="w-5 h-5 text-orange-400/50" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-orange-400/60 mb-2">TDEE</p>
                <p className="text-4xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  {calculatedMetrics.tdee}
                </p>
                <p className="text-xs mt-2 text-orange-400/60">kcal/jour</p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* SPORT */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold uppercase tracking-wide text-white/80">Sport</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
          </div>

          {/* Sport Level */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Niveau Sportif</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sportLevelOptions.map((opt) => {
                const IconComponent = opt.iconA;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, sportLevel: opt.value })}
                    className={cn(
                      "relative py-5 rounded-2xl border text-center transition-all overflow-hidden group",
                      formData.sportLevel === opt.value
                        ? "border-amber-500/40"
                        : "border-white/10 hover:border-orange-500/30"
                    )}
                    style={{
                      background:
                        formData.sportLevel === opt.value
                          ? 'rgba(251, 146, 60, 0.06)'
                          : 'rgba(255, 255, 255, 0.02)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div className="relative z-10">
                      <IconComponent
                        className={cn(
                          "w-10 h-10 mx-auto mb-3 transition-all",
                          formData.sportLevel === opt.value
                            ? "text-amber-400"
                            : "text-white/40 group-hover:text-white/60"
                        )}
                      />
                      <p className="text-sm font-bold">{opt.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Niveau d'Activité</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {activityLevelOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, activityLevel: opt.value })}
                  className={cn(
                    "py-4 rounded-xl border text-center transition-all",
                    formData.activityLevel === opt.value
                      ? "border-amber-500/40 bg-amber-500/10"
                      : "border-white/10 hover:border-amber-500/30"
                  )}
                >
                  <p className="text-sm font-bold">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Goal */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Objectif Principal</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mainGoalOptions.map((opt) => {
                const IconComponent = opt.iconA;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, mainGoal: opt.value })}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all",
                      formData.mainGoal === opt.value
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-white/10 hover:border-amber-500/30"
                    )}
                  >
                    <IconComponent
                      className={cn(
                        "w-6 h-6",
                        formData.mainGoal === opt.value ? "text-amber-400" : "text-white/40"
                      )}
                    />
                    <span className="text-sm font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

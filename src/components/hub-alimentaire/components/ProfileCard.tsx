'use client';

import { User, Scale, Ruler, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { activityLevels, goals, goalMapping } from '../constants';
import type { UserProfile, ComputedMetrics, GoalMappingEntry } from '../types';

interface ProfileCardProps {
  profile: UserProfile;
  metrics: ComputedMetrics;
  profileCardRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Carte du profil personnel
 */
export function ProfileCard({ profile, metrics, profileCardRef }: ProfileCardProps) {
  const goalInfo: GoalMappingEntry = goalMapping[profile.mainGoal] || goalMapping.maintain;

  return (
    <div ref={profileCardRef} className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Profil Personnel</h2>
          <p className="text-xs text-slate-400">Données synchronisées depuis Paramètres</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
          <Lock className="w-3 h-3" />
          <span>Lecture seule</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Weight */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <Scale className="w-3 h-3" />
            Poids (kg)
          </label>
          <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center font-bold opacity-70">
            {profile.weight}
          </div>
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <Ruler className="w-3 h-3" />
            Taille (cm)
          </label>
          <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center font-bold opacity-70">
            {profile.height}
          </div>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Âge
          </label>
          <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center font-bold opacity-70">
            {metrics.age}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Genre</label>
          <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center font-bold opacity-70">
            {profile.gender === 'male' ? 'Homme' : profile.gender === 'female' ? 'Femme' : 'Autre'}
          </div>
        </div>
      </div>

      {/* Activity Level */}
      <div className="mb-6">
        <label className="text-xs text-slate-400 mb-3 block">Niveau d&apos;activité physique</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {activityLevels.map((level) => (
            <div
              key={level.id}
              className={cn(
                "p-3 rounded-xl border text-left",
                profile.activityLevel === level.id
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "bg-white/5 border-white/5 text-slate-400 opacity-50"
              )}
            >
              <div className="text-xs font-medium">{level.label}</div>
              <div className="text-[10px] opacity-60">{level.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal */}
      <div>
        <label className="text-xs text-slate-400 mb-3 block">Objectif principal</label>
        <div className="grid grid-cols-3 gap-3">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={cn(
                "p-4 rounded-xl border text-center flex flex-col items-center gap-2",
                goalInfo.id === goal.id
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "bg-white/5 border-white/5 text-slate-400 opacity-50"
              )}
            >
              <goal.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{goal.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

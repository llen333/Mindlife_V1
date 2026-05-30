// Composant pour afficher les statistiques et achievements
'use client';

import { motion } from 'framer-motion';
import { Flame, Trophy, Star, BookOpen, Target, Zap, TrendingUp, Award } from 'lucide-react';
import type { GrowthStats, Achievement } from '../types';
import { XP_LEVELS } from '../constants';

interface StatsPanelProps {
  stats: GrowthStats;
  achievements: Achievement[];
}

export function StatsPanel({ stats, achievements }: StatsPanelProps) {
  const currentLevel = XP_LEVELS.find(l => l.level === stats.level) || XP_LEVELS[0];
  const nextLevel = XP_LEVELS.find(l => l.level === stats.level + 1);
  const xpProgress = nextLevel 
    ? Math.round(((stats.totalXp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100)
    : 100;

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const recentAchievements = unlockedAchievements.slice(0, 5);

  const statCards = [
    { label: 'Niveau', value: stats.level, subtitle: currentLevel.title, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { label: 'XP Total', value: stats.totalXp.toLocaleString(), icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    { label: 'Série Actuelle', value: `${stats.currentStreak} jours`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { label: 'Meilleure Série', value: `${stats.longestStreak} jours`, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  ];

  const additionalStats = [
    { label: 'Habitudes actives', value: stats.activeHabits, icon: Target },
    { label: 'Complétées aujourd\'hui', value: stats.completedToday, icon: TrendingUp },
    { label: 'Journaux écrits', value: stats.journalsWritten, icon: BookOpen },
    { label: 'Objectifs atteints', value: stats.goalsCompleted, icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-400">Niveau {stats.level}</p>
            <h3 className="text-2xl font-bold text-white">{currentLevel.title}</h3>
          </div>
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{stats.totalXp.toLocaleString()} XP</span>
            {nextLevel && <span className="text-slate-400">{nextLevel.xpRequired.toLocaleString()} XP</span>}
          </div>
          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          {nextLevel && (
            <p className="text-xs text-slate-500 text-center">
              {nextLevel.xpRequired - stats.totalXp} XP pour {nextLevel.title}
            </p>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl bg-slate-800/30 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.value}</p>
              </div>
            </div>
            {stat.subtitle && (
              <p className="text-xs text-slate-500">{stat.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Completion Rates */}
      <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/5">
        <h4 className="text-sm font-medium text-slate-300 mb-4">Taux de complétion</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Cette semaine</span>
              <span className="text-emerald-400">{stats.weeklyCompletion}%</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats.weeklyCompletion}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Ce mois</span>
              <span className="text-cyan-400">{stats.monthlyCompletion}%</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats.monthlyCompletion}%` }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-3">
        {additionalStats.map((stat) => (
          <div
            key={stat.label}
            className="p-3 rounded-xl bg-slate-800/20 border border-white/5 flex items-center gap-3"
          >
            <stat.icon className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Achievements */}
      <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Succès récents
          </h4>
          <span className="text-xs text-slate-500">{unlockedAchievements.length} débloqués</span>
        </div>
        
        {recentAchievements.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-700/30"
                title={achievement.description}
              >
                <span className="text-xl">{achievement.icon}</span>
                <span className="text-sm text-white">{achievement.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            Continue tes efforts pour débloquer des succès!
          </p>
        )}
      </div>
    </div>
  );
}

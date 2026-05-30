/**
 * AIProjections - Projections et insights AI
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Target,
  Info,
  ChevronRight,
  RefreshCw,
  MessageCircle,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInsight, AIRecommendation } from '../types';
import { EXPENSE_CATEGORY_MAP } from '../constants';

interface AIProjectionsProps {
  insights: AIInsight[];
  onRefresh?: () => void;
  onChatWithAI?: (message: string) => void;
}

const INSIGHT_ICONS = {
  tip: Sparkles,
  warning: TrendingDown,
  opportunity: TrendingUp,
  achievement: Target,
};

const INSIGHT_COLORS = {
  tip: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  opportunity: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  achievement: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
};

export default function AIProjections({
  insights,
  onRefresh,
  onChatWithAI,
}: AIProjectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  // Animation d'entrée
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);
  
  // Filtrer les insights non lus
  const unreadInsights = insights.filter(i => !i.isRead);
  const readInsights = insights.filter(i => i.isRead);
  
  // Projections simulées
  const projections = {
    nextMonth: {
      income: 2500,
      expenses: 1950,
      savings: 550,
      confidence: 85,
    },
    trends: [
      { label: 'Alimentation', trend: -5, amount: -20 },
      { label: 'Transport', trend: 2, amount: 3 },
      { label: 'Loisirs', trend: 15, amount: 15 },
      { label: 'Abonnements', trend: 0, amount: 0 },
    ],
  };
  
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    onChatWithAI?.(chatMessage);
    setChatMessage('');
  };
  
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-400" />
            Projections AI
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Analyses intelligentes et prévisions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
              showChat
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                : "bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-700/50"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-slate-300 text-sm hover:bg-slate-700/50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>
      
      {/* Chat Panel */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-amber-400" />
            <span className="font-medium text-white">Assistant Financier</span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Posez une question sur vos finances..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none transition-colors"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Projection Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          Prévision mois prochain
        </h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-slate-400 mb-1">Revenus estimés</p>
            <p className="text-2xl font-bold text-white">{projections.nextMonth.income}€</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <p className="text-xs text-slate-400 mb-1">Dépenses estimées</p>
            <p className="text-2xl font-bold text-white">{projections.nextMonth.expenses}€</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-slate-400 mb-1">Épargne prévue</p>
            <p className="text-2xl font-bold text-amber-400">{projections.nextMonth.savings}€</p>
          </div>
        </div>
        
        {/* Confidence Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Confiance</span>
            <span className="text-white font-medium">{projections.nextMonth.confidence}%</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${projections.nextMonth.confidence}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
        
        {/* Trends */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-400">Tendances détectées</h4>
          {projections.trends.map((trend) => (
            <div key={trend.label} className="flex items-center justify-between py-2 border-t border-white/5">
              <span className="text-sm text-slate-300">{trend.label}</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium flex items-center gap-1",
                  trend.trend > 0 ? "text-rose-400" : trend.trend < 0 ? "text-emerald-400" : "text-slate-400"
                )}>
                  {trend.trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend.trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                  {trend.trend > 0 ? '+' : ''}{trend.trend}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Insights */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Insights
        </h3>
        
        {unreadInsights.map((insight) => {
          const Icon = INSIGHT_ICONS[insight.type];
          const colors = INSIGHT_COLORS[insight.type];
          const categoryInfo = insight.category ? EXPENSE_CATEGORY_MAP[insight.category] : null;
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "relative overflow-hidden rounded-xl border p-4",
                colors.bg, colors.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bg)}>
                  <Icon className={cn("w-5 h-5", colors.text)} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{insight.title}</h4>
                    {insight.impact > 0 && (
                      <span className="text-xs text-emerald-400 font-medium">
                        +{insight.impact}€ potentiels
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{insight.message}</p>
                  
                  {categoryInfo && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm">{categoryInfo.icon}</span>
                      <span className="text-xs text-slate-500">{categoryInfo.name}</span>
                    </div>
                  )}
                </div>
                
                {insight.actionUrl && (
                  <button className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                    {insight.actionLabel}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
        
        {readInsights.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm text-slate-400 flex items-center gap-2 hover:text-slate-300">
              <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
              {readInsights.length} insight{readInsights.length > 1 ? 's' : ''} lu{readInsights.length > 1 ? 's' : ''}
            </summary>
            <div className="mt-3 space-y-2 opacity-50">
              {readInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/20 border border-white/5"
                >
                  <Info className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-400">{insight.title}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

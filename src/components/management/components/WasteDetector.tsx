/**
 * WasteDetector - Détection des gaspillages et optimisations
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  ChevronRight,
  Sparkles,
  TrendingDown,
  Receipt,
  ShoppingCart,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WasteDetection } from '../types';
import { EXPENSE_CATEGORY_MAP } from '../constants';

interface WasteDetectorProps {
  detections: WasteDetection[];
  onResolve?: (id: string) => void;
  onIgnore?: (id: string) => void;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  subscription_unused: Receipt,
  overspending: TrendingDown,
  late_fees: AlertTriangle,
  duplicate: ShoppingCart,
  unusual_pattern: Zap,
};

const SEVERITY_COLORS = {
  low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: Info },
  medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: AlertCircle },
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: AlertTriangle },
};

export default function WasteDetector({
  detections,
  onResolve,
  onIgnore,
}: WasteDetectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Animation d'entrée
  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.waste-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);
  
  // Calculer le potentiel d'économies
  const totalPotentialSavings = detections
    .filter(d => !d.isResolved)
    .reduce((sum, d) => sum + d.amount, 0);
  
  const unresolvedCount = detections.filter(d => !d.isResolved).length;
  
  // Séparer résolus et non résolus
  const unresolvedDetections = detections.filter(d => !d.isResolved);
  const resolvedDetections = detections.filter(d => d.isResolved);
  
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Détection Gaspi
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {unresolvedCount} alerte{unresolvedCount > 1 ? 's' : ''} • 
            <span className="text-emerald-400 font-semibold ml-1">
              {totalPotentialSavings.toFixed(2)}€ d'économies potentielles
            </span>
          </p>
        </div>
      </div>
      
      {/* Summary Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Optimisez vos finances</h3>
            <p className="text-sm text-slate-400 mb-4">
              Notre IA analyse vos dépenses pour détecter les gaspillages et vous suggérer des économies.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-300">{unresolvedDetections.length} à traiter</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
                <span className="text-sm text-slate-300">{resolvedDetections.length} résolues</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{totalPotentialSavings.toFixed(0)}€</p>
            <p className="text-xs text-slate-400">Économisable</p>
          </div>
        </div>
      </div>
      
      {/* Unresolved Detections */}
      <div className="space-y-3">
        {unresolvedDetections.map((detection) => {
          const TypeIcon = TYPE_ICONS[detection.type] || AlertCircle;
          const severityStyle = SEVERITY_COLORS[detection.severity];
          const categoryInfo = detection.category ? EXPENSE_CATEGORY_MAP[detection.category] : null;
          const isExpanded = expandedId === detection.id;
          
          return (
            <motion.div
              key={detection.id}
              layout
              className={cn(
                "waste-card relative overflow-hidden rounded-xl border transition-all cursor-pointer",
                severityStyle.bg,
                severityStyle.border
              )}
              onClick={() => setExpandedId(isExpanded ? null : detection.id)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", severityStyle.bg)}>
                    <TypeIcon className={cn("w-5 h-5", severityStyle.text)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{detection.title}</h4>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-medium",
                        severityStyle.bg, severityStyle.text
                      )}>
                        {detection.severity === 'high' ? 'Urgent' : detection.severity === 'medium' ? 'Modéré' : 'Info'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{detection.description}</p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className={cn("text-lg font-bold", severityStyle.text)}>{detection.amount.toFixed(2)}€</p>
                    <ChevronRight className={cn(
                      "w-4 h-4 text-slate-400 transition-transform mx-auto",
                      isExpanded && "rotate-90"
                    )} />
                  </div>
                </div>
                
                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-white/10">
                        {categoryInfo && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{categoryInfo.icon}</span>
                            <span className="text-sm text-slate-300">{categoryInfo.name}</span>
                          </div>
                        )}
                        
                        <div className="p-3 rounded-lg bg-white/5 mb-3">
                          <p className="text-sm text-white flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            {detection.suggestion}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); onResolve?.(detection.id); }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Marquer résolu
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onIgnore?.(detection.id); }}
                            className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-400 text-sm hover:bg-slate-700 transition-colors"
                          >
                            Ignorer
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
        
        {unresolvedDetections.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-white font-medium">Tout est en ordre !</p>
            <p className="text-sm text-slate-400">Aucun gaspillage détecté</p>
          </div>
        )}
      </div>
      
      {/* Resolved Detections */}
      {resolvedDetections.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-slate-400 flex items-center gap-2 hover:text-slate-300">
            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
            {resolvedDetections.length} alerte{resolvedDetections.length > 1 ? 's' : ''} résolue{resolvedDetections.length > 1 ? 's' : ''}
          </summary>
          <div className="mt-3 space-y-2 opacity-60">
            {resolvedDetections.map((detection) => (
              <div
                key={detection.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/20 border border-white/5"
              >
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-slate-400 line-through">{detection.title}</span>
                <span className="text-sm text-emerald-400 ml-auto">{detection.amount.toFixed(2)}€ économisés</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

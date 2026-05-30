'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import gsap from 'gsap';
import {
  X, Target, Calendar, Clock, Trash2, Save, Loader2, AlertCircle, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  estimatedTime?: number;
  order?: number;
  actions?: string[];
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  targetValue?: number;
  currentValue: number;
  unit?: string;
  startDate: string;
  endDate?: string;
  milestones: Milestone[];
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  progress: number;
}

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Partial<Goal>) => void;
  onDelete?: () => void;
  goal: Goal | null;
  categories: { id: string; name: string; icon: string; color: string }[];
}

const PRIORITY_OPTIONS = [
  { id: 'urgent', name: 'Urgent', color: 'rose', emoji: '🔥' },
  { id: 'important', name: 'Important', color: 'amber', emoji: '⚡' },
  { id: 'a_planifier', name: 'À planifier', color: 'cyan', emoji: '📅' },
  { id: 'en_reflexion', name: 'En réflexion', color: 'violet', emoji: '💭' },
];

const STATUS_OPTIONS = [
  { id: 'active', name: 'En cours', color: 'emerald', emoji: '🚀' },
  { id: 'paused', name: 'En pause', color: 'amber', emoji: '⏸️' },
  { id: 'completed', name: 'Terminé', color: 'cyan', emoji: '✅' },
];

// ============================================================================
// COMPOSANT
// ============================================================================

export default function GoalModal({ isOpen, onClose, onSave, onDelete, goal, categories }: GoalModalProps) {
  // Refs for GSAP animations
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const closeAnimationRef = useRef<gsap.core.Tween | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('a_planifier');
  const [status, setStatus] = useState('active');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Initialize form when editing - form state sync is intentional here
  useEffect(() => {
    if (!isOpen) return;
    
    /* eslint-disable react-hooks/set-state-in-effect */
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setPriority(goal.priority || 'a_planifier');
      setStatus(goal.status || 'active');
      setCategoryId(goal.categoryId || '');
      setStartDate(goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '');
      setEndDate(goal.endDate ? new Date(goal.endDate).toISOString().split('T')[0] : '');
      setTargetValue(goal.targetValue?.toString() || '');
      setUnit(goal.unit || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('a_planifier');
      setStatus('active');
      setCategoryId(categories[0]?.id || '');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setTargetValue('');
      setUnit('');
    }
    setErrors([]);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [goal, isOpen, categories]);

  // Open animation - setIsVisible is intentional here to trigger animation
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
      
      // Animate backdrop
      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.15, ease: 'power2.out' }
        );
      }
      
      // Animate modal content
      if (modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.98, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Error animation
  useEffect(() => {
    if (errorRef.current) {
      if (errors.length > 0) {
        gsap.fromTo(
          errorRef.current,
          { opacity: 0, height: 0 },
          { opacity: 1, height: 'auto', duration: 0.25, ease: 'power2.out' }
        );
      }
    }
  }, [errors]);

  // Close with animation
  const handleCloseWithAnimation = useCallback(() => {
    // Kill any existing close animation
    if (closeAnimationRef.current) {
      closeAnimationRef.current.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        onClose();
      }
    });

    // Animate modal out
    if (modalRef.current) {
      tl.to(modalRef.current, {
        scale: 0.98,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      }, 0);
    }

    // Animate backdrop out
    if (overlayRef.current) {
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in'
      }, 0);
    }

    closeAnimationRef.current = tl;
  }, [onClose]);

  // Validate & save
  const handleSave = async () => {
    const newErrors: string[] = [];
    
    if (!title.trim()) {
      newErrors.push('Le titre est obligatoire');
    }
    
    // Validation: date de fin >= date de début
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.push('La date limite ne peut pas être antérieure à la date de début');
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (goal && !goal.id) {
      setErrors(['Erreur: ID de l\'objectif manquant']);
      return;
    }
    
    setIsSaving(true);
    setErrors([]);
    
    try {
      const saveData = {
        id: goal?.id,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        categoryId: categoryId || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
        unit: unit.trim() || undefined,
      };
      
      await onSave(saveData);
    } catch (error) {
      console.error('GoalModal save error:', error);
      setErrors(['Une erreur est survenue lors de la sauvegarde']);
    } finally {
      setIsSaving(false);
    }
  };

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseWithAnimation();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleCloseWithAnimation]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleCloseWithAnimation}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* === HEADER === */}
        <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {goal ? '✏️ Modifier l\'Objectif' : '✨ Nouvel Objectif'}
                </h2>
                <p className="text-sm text-slate-400">
                  {goal ? 'Mettez à jour les informations' : 'Définissez votre nouvel objectif'}
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseWithAnimation}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Date Display - Show dates if they exist */}
          {goal && (goal.startDate || goal.endDate) && (
            <div className="mt-4 flex items-center gap-4">
              {goal.startDate && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
                  <Calendar className="w-4 h-4 text-cyan-300" />
                  <span className="text-sm text-cyan-200 font-semibold">
                    Début: {new Date(goal.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
              {goal.endDate && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/40 shadow-lg shadow-violet-500/10">
                  <Clock className="w-4 h-4 text-violet-300" />
                  <span className="text-sm text-violet-200 font-semibold">
                    Fin: {new Date(goal.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* === CONTENT === */}
        <div className="p-6 space-y-5">
          {/* Errors */}
          {errors.length > 0 && (
            <div
              ref={errorRef}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30"
            >
              {errors.map((err, i) => (
                <p key={i} className="text-sm text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {err}
                </p>
              ))}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Apprendre React"
              className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:bg-white/[0.07] focus:outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre objectif..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:bg-white/[0.07] focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-violet-500/50 focus:outline-none cursor-pointer"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-slate-800">
                    {opt.emoji} {opt.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-violet-500/50 focus:outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-slate-800">
                    {opt.emoji} {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Catégorie
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500/50 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-800">Sans catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-800">
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-white font-medium focus:border-cyan-400 focus:bg-cyan-500/15 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-violet-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                Date limite
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-white font-medium focus:outline-none transition-all",
                  endDate && startDate && new Date(endDate) < new Date(startDate)
                    ? "bg-rose-500/15 border-rose-500/50 focus:border-rose-400"
                    : "bg-violet-500/10 border border-violet-500/30 focus:border-violet-400 focus:bg-violet-500/15"
                )}
              />
            </div>
          </div>

          {/* Target Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Valeur cible
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Ex: 100"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Unité
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ex: kg, km, livres..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* === FOOTER === */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between gap-3">
            <div>
              {onDelete && goal && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm hover:bg-rose-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Supprimer
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCloseWithAnimation}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || isSaving}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm min-w-[160px] justify-center",
                  title.trim() && !isSaving
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {goal ? 'Mettre à jour' : 'Créer l\'objectif'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

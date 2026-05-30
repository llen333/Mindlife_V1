// Growth Modals - Transparent Glassmorphism
'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check, Clock, Calendar, Target, BookOpen, Video, Headphones, FileText, ExternalLink, Star, Play, Pause, ChevronRight, Zap, TrendingUp, Users, DollarSign, Briefcase, Lightbulb, Rocket, Brain, Heart, Sun, Moon, Sparkles, BookMarked, Quote, List } from 'lucide-react';
import type { GrowthRoutine, GrowthGoal, PersonalResource, PsycheResource, MentalCard, ProfessionalProject } from '../types';
import { statusColors, growthCategories, philosophies } from '../constants';
import { bookPreviews, getYouTubeId, isYouTubeUrl } from '../utils';

// ============================================
// BASE MODAL COMPONENT - With Portal
// ============================================

interface BaseModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function BaseModal({ isVisible, onClose, children, size = 'md' }: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, handleClickOutside, handleEscape]);

  if (!isVisible || !mounted) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* NO dark backdrop - transparent */}
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`relative ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl`}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-3xl pointer-events-none" />
        
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// ============================================
// ROUTINE MODAL
// ============================================

interface RoutineModalProps {
  isVisible: boolean;
  onClose: () => void;
  routine: GrowthRoutine | null;
  onComplete?: (id: string) => void;
}

export function RoutineModal({ isVisible, onClose, routine, onComplete }: RoutineModalProps) {
  if (!routine) return null;

  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <BaseModal isVisible={isVisible} onClose={onClose} size="lg">
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${routine.color}20` }}
            >
              {routine.icon}
            </div>
            <div>
              <h2 className="text-2xl font-light text-white tracking-wide">{routine.title}</h2>
              <p className="text-white/50 text-sm mt-1">{routine.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-3xl font-light text-white">{routine.currentStreak}</div>
            <div className="text-white/40 text-xs uppercase tracking-wider mt-1">Série actuelle</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-3xl font-light text-emerald-400">{routine.bestStreak}</div>
            <div className="text-white/40 text-xs uppercase tracking-wider mt-1">Meilleure série</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-3xl font-light text-white">{routine.totalCompletions}</div>
            <div className="text-white/40 text-xs uppercase tracking-wider mt-1">Total</div>
          </div>
        </div>

        {/* Schedule */}
        <div className="mb-8">
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Horaire</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="w-4 h-4" />
              <span>{routine.timeOfDay}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="w-4 h-4" />
              <span>{routine.duration} min</span>
            </div>
            <div className="flex gap-1">
              {days.map((day, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                    routine.daysOfWeek?.includes(i) 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/5 text-white/30'
                  }`}
                >
                  {day[0]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Étapes</h3>
          <div className="space-y-3">
            {routine.steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                  {step.isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-white font-light">{step.title}</div>
                  {step.description && (
                    <div className="text-white/40 text-sm">{step.description}</div>
                  )}
                </div>
                {step.duration && (
                  <div className="text-white/30 text-sm">{step.duration} min</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Complete Button */}
        {onComplete && (
          <button
            onClick={() => onComplete(routine.id)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-light tracking-wider hover:from-emerald-500/30 hover:to-emerald-600/30 transition-all"
          >
            Marquer comme complété
          </button>
        )}
      </div>
    </BaseModal>
  );
}

// ============================================
// GOAL MODAL
// ============================================

interface GoalModalProps {
  isVisible: boolean;
  onClose: () => void;
  goal: GrowthGoal | null;
  onUpdate?: (id: string, value: number) => void;
}

export function GoalModal({ isVisible, onClose, goal, onUpdate }: GoalModalProps) {
  if (!goal) return null;

  const category = growthCategories.find(c => c.id === goal.category);
  const philosophy = philosophies.find(p => p.id === goal.philosophy);

  return (
    <BaseModal isVisible={isVisible} onClose={onClose} size="lg">
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${category?.color || '#888'}20` }}
            >
              {category?.icon || '🎯'}
            </div>
            <div>
              <h2 className="text-2xl font-light text-white tracking-wide">{goal.title}</h2>
              <p className="text-white/50 text-sm mt-1">{goal.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <div className="text-white/60 text-xs uppercase tracking-wider">Progression</div>
            <div className="text-3xl font-light text-white">{goal.progress}%</div>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
          {goal.targetValue && (
            <div className="flex justify-between mt-2 text-white/40 text-sm">
              <span>{goal.currentValue} {goal.unit}</span>
              <span>{goal.targetValue} {goal.unit}</span>
            </div>
          )}
        </div>

        {/* Philosophy */}
        {philosophy && (
          <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs uppercase tracking-wider">Philosophie</span>
            </div>
            <div className="text-white font-light">{philosophy.name}</div>
            <div className="text-white/50 text-sm">{philosophy.description}</div>
          </div>
        )}

        {/* Identity Statement */}
        {goal.identityStatement && (
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
            <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Identité</div>
            <div className="text-white font-light italic">"{goal.identityStatement}"</div>
          </div>
        )}

        {/* Milestones */}
        <div className="mb-8">
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Jalons</h3>
          <div className="space-y-2">
            {goal.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                  milestone.completed 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  milestone.completed ? 'bg-emerald-500 text-black' : 'bg-white/10'
                }`}>
                  {milestone.completed && <Check className="w-4 h-4" />}
                </div>
                <span className={`font-light ${milestone.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Update Progress */}
        {onUpdate && goal.targetValue && (
          <div className="flex gap-4">
            <input
              type="range"
              min="0"
              max={goal.targetValue}
              value={goal.currentValue}
              onChange={(e) => onUpdate(goal.id, parseInt(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={() => onUpdate(goal.id, goal.currentValue + 1)}
              className="px-6 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              +1
            </button>
          </div>
        )}
      </div>
    </BaseModal>
  );
}

// ============================================
// RESOURCE MODAL - WITH BOOK PREVIEW
// ============================================

interface ResourceModalProps {
  isVisible: boolean;
  onClose: () => void;
  resource: PersonalResource | null;
  onUpdate?: (id: string, data: Partial<PersonalResource>) => void;
}

export function ResourceModal({ isVisible, onClose, resource, onUpdate }: ResourceModalProps) {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  if (!resource) return null;

  const typeIcons = {
    book: BookOpen,
    video: Video,
    audio: Headphones,
    article: FileText,
    course: Zap,
  };
  const Icon = typeIcons[resource.type] || BookOpen;
  
  // Get book preview data
  const bookPreview = resource.type === 'book' ? bookPreviews[resource.title] : null;
  
  // Get YouTube ID for video embedding
  const youtubeId = resource.type === 'video' && resource.url ? getYouTubeId(resource.url) : null;
  
  // Handle video click - play inline
  const handleVideoClick = () => {
    if (youtubeId) {
      setShowVideoPlayer(true);
    }
  };

  // Render video player inline
  if (showVideoPlayer && youtubeId) {
    return (
      <BaseModal isVisible={isVisible} onClose={() => setShowVideoPlayer(false)} size="xl">
        <div className="relative">
          {/* Video Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-light text-white">{resource.title}</h3>
              {resource.author && (
                <p className="text-white/40 text-sm">{resource.author}</p>
              )}
            </div>
            <button
              onClick={() => setShowVideoPlayer(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Video Player */}
          <div className="aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          {/* Description */}
          {resource.description && (
            <div className="p-4 border-t border-white/10">
              <p className="text-white/60 text-sm">{resource.description}</p>
            </div>
          )}
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal isVisible={isVisible} onClose={onClose} size="lg">
      <div className="relative p-8">
        {/* Header */}
        <div className="flex gap-6 mb-8">
          {/* Cover */}
          <div className="w-32 h-44 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
            {resource.imageUrl && !imageError ? (
              <img 
                src={resource.imageUrl} 
                alt={resource.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                <Icon className="w-12 h-12 text-white/30" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-white/40" />
                  <span className="text-white/40 text-xs uppercase tracking-wider">{resource.type}</span>
                </div>
                <h2 className="text-2xl font-light text-white tracking-wide">{resource.title}</h2>
                {resource.author && (
                  <p className="text-white/50 text-sm mt-1">par {resource.author}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/40 text-sm">Progression</span>
                <span className="text-white text-sm">{resource.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ width: `${resource.progress}%` }}
                />
              </div>
            </div>

            {/* Rating */}
            {resource.rating && (
              <div className="flex items-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < resource.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-white/20'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Book Preview Section */}
        {resource.type === 'book' && bookPreview && (
          <div className="mb-6 space-y-4">
            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <BookMarked className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-xs uppercase tracking-wider">Résumé</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{bookPreview.summary}</p>
            </div>
            
            {/* Key Takeaways */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <List className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-xs uppercase tracking-wider">Points Clés</span>
              </div>
              <ul className="space-y-2">
                {bookPreview.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/70 text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Description (for non-books or books without preview) */}
        {resource.description && !bookPreview && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-white/70">{resource.description}</p>
          </div>
        )}

        {/* Notes */}
        {resource.notes && (
          <div className="mb-6">
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-2">Mes notes</h3>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/70 whitespace-pre-wrap">{resource.notes}</p>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/60 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {/* For videos - Play inline button */}
          {resource.type === 'video' && youtubeId && (
            <button
              onClick={handleVideoClick}
              className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Regarder
            </button>
          )}
          
          {/* For books without preview or other resources - External link */}
          {resource.url && resource.type !== 'video' && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {resource.type === 'book' ? 'Acheter le livre' : 'Ouvrir'}
            </a>
          )}
          
          {onUpdate && (
            <button
              onClick={() => onUpdate(resource.id, { progress: Math.min(100, resource.progress + 10) })}
              className="flex-1 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              +10% Progression
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

// ============================================
// PSYCHE RESOURCE MODAL - WITH VIDEO EMBED
// ============================================

interface PsycheResourceModalProps {
  isVisible: boolean;
  onClose: () => void;
  resource: PsycheResource | null;
}

export function PsycheResourceModal({ isVisible, onClose, resource }: PsycheResourceModalProps) {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  if (!resource) return null;

  const sourceLabels: Record<string, string> = {
    'neville-goddard': 'Neville Goddard',
    'carl-jung': 'Carl Jung',
    'synchronicity': 'La Synchronicité',
    'hermes': 'Hermès Trismégiste',
    'thot': 'Thot',
    'other': 'Autre',
  };
  
  // Get YouTube ID for video embedding
  const youtubeId = resource.type === 'video' && resource.url ? getYouTubeId(resource.url) : null;
  
  // Handle video click - play inline
  const handleVideoClick = () => {
    if (youtubeId) {
      setShowVideoPlayer(true);
    }
  };

  // Render video player inline
  if (showVideoPlayer && youtubeId) {
    return (
      <BaseModal isVisible={isVisible} onClose={() => setShowVideoPlayer(false)} size="xl">
        <div className="relative">
          {/* Video Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              {resource.source && (
                <div className="text-purple-400 text-xs uppercase tracking-wider mb-1">
                  {sourceLabels[resource.source]}
                </div>
              )}
              <h3 className="text-lg font-light text-white">{resource.title}</h3>
              {resource.author && (
                <p className="text-white/40 text-sm">{resource.author}</p>
              )}
            </div>
            <button
              onClick={() => setShowVideoPlayer(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Video Player */}
          <div className="aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          {/* Key Concepts */}
          {resource.keyConcepts.length > 0 && (
            <div className="p-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                {resource.keyConcepts.map((concept) => (
                  <span
                    key={concept}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal isVisible={isVisible} onClose={onClose} size="lg">
      <div className="relative p-8">
        {/* Header */}
        <div className="flex gap-6 mb-8">
          {/* Cover or Video Thumbnail */}
          <div className="w-32 h-44 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
            {resource.imageUrl && !imageError ? (
              <img 
                src={resource.imageUrl} 
                alt={resource.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                {resource.type === 'video' ? (
                  <Video className="w-12 h-12 text-white/30" />
                ) : (
                  <BookOpen className="w-12 h-12 text-white/30" />
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                {resource.source && (
                  <div className="text-purple-400 text-xs uppercase tracking-wider mb-2">
                    {sourceLabels[resource.source]}
                  </div>
                )}
                <h2 className="text-2xl font-light text-white tracking-wide">{resource.title}</h2>
                <p className="text-white/50 text-sm mt-1">{resource.author}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Status */}
            <div className="mt-4">
              <span 
                className="px-3 py-1 rounded-full text-xs"
                style={{ 
                  backgroundColor: `${statusColors[resource.status ?? 'to-read']}20`,
                  color: statusColors[resource.status ?? 'to-read']
                }}
              >
                {resource.status === 'to-explore' ? 'À explorer' : 
                 resource.status === 'exploring' ? 'En exploration' : 'Intégré'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-white/70">{resource.description}</p>
          </div>
        )}

        {/* Key Concepts */}
        {resource.keyConcepts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Concepts clés</h3>
            <div className="flex flex-wrap gap-2">
              {resource.keyConcepts.map((concept) => (
                <span
                  key={concept}
                  className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {resource.notes && (
          <div className="mb-6">
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-2">Mes notes</h3>
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
              <p className="text-white/70">{resource.notes}</p>
            </div>
          </div>
        )}

        {/* Practice Instructions */}
        {resource.practiceInstructions && (
          <div className="mb-6">
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-2">Instructions de pratique</h3>
            <div className="space-y-2">
              {resource.practiceInstructions.map((instruction, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-purple-400 font-mono">{i + 1}.</span>
                  <span className="text-white/70">{instruction}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          {/* For videos - Play inline button */}
          {resource.type === 'video' && youtubeId && (
            <button
              onClick={handleVideoClick}
              className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Regarder
            </button>
          )}
          
          {/* External link for non-videos or videos without YouTube */}
          {resource.url && resource.type !== 'video' && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Accéder à la ressource
            </a>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

// ============================================
// MENTAL CARD MODAL (FLIP CARD)
// ============================================

interface MentalCardModalProps {
  isVisible: boolean;
  onClose: () => void;
  cards: MentalCard[];
  currentIndex: number;
  onFlip: () => void;
  onNext: () => void;
  onPrev: () => void;
  isFlipped: boolean;
}

export function MentalCardModal({ 
  isVisible, 
  onClose, 
  cards, 
  currentIndex, 
  onFlip, 
  onNext, 
  onPrev, 
  isFlipped 
}: MentalCardModalProps) {
  const currentCard = cards[currentIndex];
  
  if (!currentCard) return null;

  return (
    <BaseModal isVisible={isVisible} onClose={onClose} size="md">
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-white/40 text-sm">
            Carte {currentIndex + 1} / {cards.length}
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Flip Card */}
        <div 
          className="relative h-64 mb-6 cursor-pointer perspective-1000"
          onClick={onFlip}
        >
          <div 
            className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden">
              <div className="h-full rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-6 flex flex-col items-center justify-center text-center">
                <div className="text-purple-400 text-xs uppercase tracking-wider mb-4">
                  {currentCard.category}
                </div>
                <p className="text-xl text-white font-light">{currentCard.front}</p>
                {currentCard.source && (
                  <div className="text-white/40 text-sm mt-4">— {currentCard.source}</div>
                )}
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180">
              <div className="h-full rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-6 flex items-center justify-center text-center">
                <p className="text-lg text-white/90">{currentCard.back}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${currentCard.masteryLevel}%` }}
            />
          </div>
          <div className="text-white/40 text-xs text-center mt-2">
            Maîtrise: {currentCard.masteryLevel}%
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            disabled={currentIndex === 0}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            ← Précédent
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            disabled={currentIndex === cards.length - 1}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            Suivant →
          </button>
        </div>
      </div>

      {/* CSS for 3D flip */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </BaseModal>
  );
}

// ============================================
// PROJECT MODAL
// ============================================

interface ProjectModalProps {
  isVisible: boolean;
  onClose: () => void;
  project: ProfessionalProject | null;
}

export function ProjectModal({ isVisible, onClose, project }: ProjectModalProps) {
  if (!project) return null;

  const typeIcons = {
    business: Briefcase,
    'side-project': Rocket,
    investment: DollarSign,
    skill: Lightbulb,
  };
  const Icon = typeIcons[project.type] || Target;

  const statusColors = {
    idea: '#64748b',
    planning: '#f59e0b',
    active: '#10b981',
    paused: '#ef4444',
    completed: '#3b82f6',
  };

  return (
    <BaseModal isVisible={isVisible} onClose={onClose} size="lg">
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <Icon className="w-8 h-8 text-white/60" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="px-2 py-0.5 rounded text-xs uppercase"
                  style={{ 
                    backgroundColor: `${statusColors[project.status]}20`,
                    color: statusColors[project.status]
                  }}
                >
                  {project.status}
                </span>
                <span className="text-white/40 text-xs">{project.type}</span>
              </div>
              <h2 className="text-2xl font-light text-white tracking-wide">{project.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Description */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/70">{project.description}</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-white/60 text-xs uppercase tracking-wider">Progression</span>
            <span className="text-2xl font-light text-white">{project.progress}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Budget */}
        {(project.budget || project.spent) && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-white/40 text-xs uppercase mb-1">Budget</div>
              <div className="text-xl text-white font-light">{project.budget?.toLocaleString()} €</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-white/40 text-xs uppercase mb-1">Dépensé</div>
              <div className="text-xl text-white font-light">{project.spent?.toLocaleString()} €</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-white/40 text-xs uppercase mb-1">ROI</div>
              <div className="text-xl text-emerald-400 font-light">{project.roi || 0}%</div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/60 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}

// ============================================
// ADD/EDIT MODAL
// ============================================

interface AddModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'routine' | 'goal' | 'resource' | 'project' | 'psyche';
  onSave: (data: any) => void;
  initialData?: unknown;
}

export function AddModal({ isVisible, onClose, type, onSave, initialData }: AddModalProps) {
  const typeLabels = {
    routine: 'Nouvelle Routine',
    goal: 'Nouvel Objectif',
    resource: 'Nouvelle Ressource',
    project: 'Nouveau Projet',
    psyche: 'Nouvelle Ressource Psyché',
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [resourceType, setResourceType] = useState<'video' | 'book' | 'audio' | 'article'>('video');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('mindset');

  // Reset form when visible or type changes
  useEffect(() => {
    if (isVisible) {
      setTitle('');
      setDescription('');
      setAuthor('');
      setResourceType('video');
      setUrl('');
      setCategory('mindset');
    }
  }, [isVisible, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (type === 'resource' || type === 'psyche') {
      onSave({
        title,
        description,
        author: author || (resourceType === 'video' ? 'Chaîne YouTube' : 'Auteur inconnu'),
        type: resourceType,
        url,
        category,
      });
    } else {
      onSave({
        title,
        description,
      });
    }
  };

  return (
    <BaseModal isVisible={isVisible} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light text-white">{typeLabels[type]}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block font-light font-medium">Titre *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all font-light text-sm"
              placeholder="Ex: Lois de l'Assomption, Discipline de fer..."
            />
          </div>

          {(type === 'resource' || type === 'psyche') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block font-light">Type de Ressource</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-light text-sm"
                  >
                    <option value="video" className="bg-slate-900 text-white">Vidéo</option>
                    <option value="book" className="bg-slate-900 text-white">Livre</option>
                    <option value="audio" className="bg-slate-900 text-white">Audio / Podcast</option>
                    <option value="article" className="bg-slate-900 text-white">Article</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block font-light">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-light text-sm"
                  >
                    <option value="mindset" className="bg-slate-900 text-white">Mindset</option>
                    <option value="productivity" className="bg-slate-900 text-white">Productivité</option>
                    <option value="body" className="bg-slate-900 text-white">Santé & Corps</option>
                    <option value="psyche" className="bg-slate-900 text-white">Psyché</option>
                    <option value="finance" className="bg-slate-900 text-white">Finance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block font-light">
                  {resourceType === 'video' ? 'Chaîne YouTube / Auteur' : 'Auteur'}
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all font-light text-sm"
                  placeholder={resourceType === 'video' ? "Nom de la chaîne..." : "Nom de l'auteur..."}
                />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block font-light">
                  URL {resourceType === 'video' ? '(Lien YouTube pour lecture en direct)' : '(Optionnel)'}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all font-light text-sm"
                  placeholder={resourceType === 'video' ? "https://www.youtube.com/watch?v=..." : "https://..."}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block font-light font-medium">Description (Optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all font-light text-sm resize-none h-24"
              placeholder="Quelques notes ou détails sur cette ressource..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all font-light text-sm shadow-md hover:shadow-emerald-500/10"
          >
            Sauvegarder la ressource
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Calendar, Clock, MapPin, Users, Bell, FileText, Tag,
  X, Edit3, Trash2, Repeat, CheckCircle2, Sparkles
} from 'lucide-react';
import { Event } from '@/lib/store';
import { COLOR_BG_TRANSPARENT_CLASS } from '@/lib/data/constants';

// Priority configuration
const PRIORITY_CONFIG = {
  low: { label: 'Basse', color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
  medium: { label: 'Moyenne', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  high: { label: 'Haute', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  urgent: { label: 'Urgente', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
};

// Event illustrations for different categories
const EVENT_ILLUSTRATIONS: Record<string, { emoji: string; gradient: string }> = {
  'cat-sport': { emoji: '🏃', gradient: 'from-emerald-500/20 to-cyan-500/20' },
  'cat-education': { emoji: '📚', gradient: 'from-blue-500/20 to-violet-500/20' },
  'cat-personal': { emoji: '🧠', gradient: 'from-violet-500/20 to-purple-500/20' },
  'cat-spirituality': { emoji: '🧘', gradient: 'from-amber-500/20 to-orange-500/20' },
  'cat-professional': { emoji: '💼', gradient: 'from-slate-500/20 to-gray-500/20' },
};

interface EventDetailModalProps {
  event: Event;
  category: { name: string; icon: string; color: string };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EventDetailModal({
  event,
  category,
  onClose,
  onEdit,
  onDelete
}: EventDetailModalProps) {
  const illustration = EVENT_ILLUSTRATIONS[event.categoryId] || EVENT_ILLUSTRATIONS['cat-professional'];
  const priority = event.priority ? PRIORITY_CONFIG[event.priority] : null;

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Overlay animation
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );

      // Modal animation
      gsap.fromTo(modalRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.2)' }
      );

      // Icon animation
      gsap.fromTo(iconRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.5, delay: 0.2, ease: 'back.out(1.7)' }
      );

      // Title animation
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.1, ease: 'power2.out' }
      );

      // Description animation
      gsap.fromTo(descRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.15, ease: 'power2.out' }
      );

      // Content cards animation
      if (contentRef.current) {
        const cards = contentRef.current.querySelectorAll('.detail-card');
        gsap.fromTo(cards,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, delay: 0.2, ease: 'power2.out' }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleClose = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(modalRef.current, {
      scale: 0.9,
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onClose
    });
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl
                   bg-gradient-to-br from-slate-900/95 to-slate-800/95
                   backdrop-blur-xl border border-white/[0.1]
                   shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className={`relative p-6 bg-gradient-to-r ${illustration.gradient} border-b border-white/[0.05]`}>
          <div className="absolute top-4 right-4 flex gap-2">
            <AnimatedModalButton onClick={onEdit}>
              <Edit3 className="w-4 h-4" />
            </AnimatedModalButton>
            <AnimatedModalButton onClick={onDelete} variant="danger">
              <Trash2 className="w-4 h-4" />
            </AnimatedModalButton>
            <AnimatedModalButton onClick={handleClose}>
              <X className="w-4 h-4" />
            </AnimatedModalButton>
          </div>

          <div className="flex items-start gap-4">
            <div
              ref={iconRef}
              className={`w-16 h-16 rounded-2xl ${event.color ? COLOR_BG_TRANSPARENT_CLASS[event.color] : 'bg-white/10'} flex items-center justify-center border border-white/10 backdrop-blur-sm`}
            >
              <span className="text-3xl">{illustration.emoji}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/70 border border-white/10">
                  {category.icon} {category.name}
                </span>
                {priority && (
                  <span className={`text-xs px-3 py-1 rounded-full ${priority.bg} ${priority.color} border ${priority.border}`}>
                    {priority.label}
                  </span>
                )}
                {event.createdBy === 'ai' && (
                  <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 flex items-center gap-1 border border-violet-500/20">
                    <Sparkles className="w-3 h-3" /> IA
                  </span>
                )}
              </div>
              <h2
                ref={titleRef}
                className="text-2xl font-bold text-white mb-1"
              >
                {event.title}
              </h2>
              <p
                ref={descRef}
                className="text-white/60 text-sm"
              >
                {event.description || 'Aucune description'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="p-6 space-y-4 overflow-y-auto max-h-[50vh] custom-scrollbar">
          {/* Date & Time Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="detail-card p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm text-white/60">Date</span>
              </div>
              <p className="text-base font-semibold text-white">
                {new Date(event.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="detail-card p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-sm text-white/60">Horaires</span>
              </div>
              <p className="text-base font-semibold text-white">
                {event.isAllDay ? 'Toute la journée' : `${event.startTime} - ${event.endTime || '?'}`}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            {event.location && (
              <div className="detail-card p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm text-white/60">Lieu</span>
                </div>
                <p className="text-white">{event.location}</p>
              </div>
            )}

            {/* Reminder */}
            {event.reminderEnabled && event.reminder && (
              <div className="detail-card p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-sm text-white/60">Rappel</span>
                </div>
                <p className="text-white">{event.reminder} minutes avant</p>
              </div>
            )}

            {/* Participants */}
            {event.participants && event.participants.length > 0 && (
              <div className="detail-card p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-rose-400" />
                  </div>
                  <span className="text-sm text-white/60">Participants</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.participants.map((p, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-white border border-white/10">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {event.notes && (
              <div className="detail-card p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-500/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm text-white/60">Notes</span>
                </div>
                <p className="text-white/80">{event.notes}</p>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="detail-card p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm text-white/60">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/20">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recurrence */}
            {event.recurrence && event.recurrence !== 'none' && (
              <div className="detail-card p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Repeat className="w-4 h-4 text-violet-400" />
                  </div>
                  <span className="text-sm text-white/60">Récurrence</span>
                </div>
                <p className="text-white capitalize">{event.recurrence}</p>
              </div>
            )}

            {/* Status */}
            {event.status && (
              <div className="detail-card p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm text-white/60">Statut</span>
                </div>
                <p className="text-white capitalize">{event.status.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.05] flex justify-between items-center bg-slate-900/50">
          <span className="text-xs text-slate-500">
            Créé le {new Date(event.createdAt).toLocaleDateString('fr-FR')}
          </span>
          <div className="flex gap-2">
            <AnimatedButton
              onClick={onDelete}
              className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all text-sm font-medium border border-rose-500/20"
            >
              Supprimer
            </AnimatedButton>
            <AnimatedButton
              onClick={onEdit}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-emerald-500/30 transition-all text-sm font-medium border border-cyan-500/20"
            >
              Modifier
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// Animated Modal Button - CSS natif
function AnimatedModalButton({
  children,
  onClick,
  variant = 'default'
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  const baseClass = "w-10 h-10 rounded-xl backdrop-blur-sm flex items-center justify-center transition-all duration-150 border hover:scale-110 active:scale-90";
  const variantClass = variant === 'danger'
    ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-rose-500/20"
    : "bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border-white/10";

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${variantClass}`}
    >
      {children}
    </button>
  );
}

// Animated Button - CSS natif
function AnimatedButton({
  children,
  onClick,
  className = ''
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`${className} transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]`}
    >
      {children}
    </button>
  );
}

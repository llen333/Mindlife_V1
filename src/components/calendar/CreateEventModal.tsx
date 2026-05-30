'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Plus, CheckCircle2 } from 'lucide-react';
import { Event } from '@/lib/store';

interface CreateEventModalProps {
  date: string;
  event: Event | null;
  categories: Array<{ id: string; name: string; icon: string; color: string }>;
  onClose: () => void;
  onSave: (data: Partial<Event> & { createTask?: boolean }) => void;
}

export default function CreateEventModal({
  date,
  event,
  categories,
  onClose,
  onSave
}: CreateEventModalProps) {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || date,
    startTime: event?.startTime || '09:00',
    endTime: event?.endTime || '10:00',
    isAllDay: event?.isAllDay || false,
    categoryId: event?.categoryId || 'cat-professional',
    color: event?.color || 'emerald',
    priority: event?.priority || 'medium',
    location: event?.location || '',
    reminder: event?.reminder || 15,
    reminderEnabled: event?.reminderEnabled ?? true,
    participants: event?.participants || [],
    notes: event?.notes || '',
    tags: event?.tags || [],
  });

  // State for creating associated task (only for new events)
  const [createTask, setCreateTask] = useState(false);

  const [participantInput, setParticipantInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleAddParticipant = () => {
    if (participantInput.trim()) {
      setFormData({
        ...formData,
        participants: [...(formData.participants || []), participantInput.trim()]
      });
      setParticipantInput('');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
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
        className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl
                   bg-gradient-to-br from-slate-900/95 to-slate-800/95
                   backdrop-blur-xl border border-white/[0.1]
                   shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.05] flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-emerald-500/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center border border-cyan-500/20">
              <Plus className="w-5 h-5 text-cyan-400" />
            </div>
            {event ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h2>
          <CloseButton onClick={handleClose} />
        </div>

        {/* Form */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Titre de l'événement"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'événement..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 resize-none transition-all"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white focus:border-cyan-500/50 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Début</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                disabled={formData.isAllDay}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white focus:border-cyan-500/50 focus:outline-none disabled:opacity-50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Fin</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                disabled={formData.isAllDay}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white focus:border-cyan-500/50 focus:outline-none disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <AnimatedCheckbox
              checked={formData.isAllDay || false}
              onChange={(checked) => setFormData({ ...formData, isAllDay: checked })}
              color="cyan"
            />
            <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">Toute la journée</span>
          </label>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Catégorie</label>
              <select
                value={formData.categoryId}
                onChange={(e) => {
                  const cat = categories.find(c => c.id === e.target.value);
                  setFormData({ ...formData, categoryId: e.target.value, color: cat?.color || 'emerald' });
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white focus:border-cyan-500/50 focus:outline-none transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Priorité</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Event['priority'] })}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white focus:border-cyan-500/50 focus:outline-none transition-all"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Lieu</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Adresse ou lieu"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all"
            />
          </div>

          {/* Reminder */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <AnimatedCheckbox
                checked={formData.reminderEnabled || false}
                onChange={(checked) => setFormData({ ...formData, reminderEnabled: checked })}
                color="amber"
              />
              <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">Rappel</span>
            </label>
            {formData.reminderEnabled && (
              <select
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: parseInt(e.target.value) })}
                className="px-3 py-2 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-all"
              >
                <option value={5}>5 min avant</option>
                <option value={15}>15 min avant</option>
                <option value={30}>30 min avant</option>
                <option value={60}>1h avant</option>
                <option value={1440}>1 jour avant</option>
              </select>
            )}
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Participants</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                placeholder="Ajouter un participant"
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:border-cyan-500/50 focus:outline-none transition-all"
              />
              <AddButton onClick={handleAddParticipant} color="cyan" />
            </div>
            {formData.participants && formData.participants.length > 0 && (
              <TagList
                items={formData.participants}
                onRemove={(idx) => setFormData({ ...formData, participants: formData.participants?.filter((_, i) => i !== idx) })}
                variant="default"
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Ajouter un tag"
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:border-cyan-500/50 focus:outline-none transition-all"
              />
              <AddButton onClick={handleAddTag} color="emerald" />
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <TagList
                items={formData.tags}
                onRemove={(idx) => setFormData({ ...formData, tags: formData.tags?.filter((_, i) => i !== idx) })}
                variant="emerald"
                prefix="#"
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes supplémentaires..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none resize-none transition-all"
            />
          </div>

          {/* Create associated task - Only for new events */}
          {!event && (
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20 transition-all">
              <AnimatedCheckbox
                checked={createTask}
                onChange={setCreateTask}
                color="amber"
              />
              <div className="flex-1">
                <span className="text-sm text-white/90 font-medium">Créer une tâche associée</span>
                <p className="text-xs text-white/50">Cette tâche apparaîtra dans la page Tâches</p>
              </div>
              <CheckCircle2 className={`w-5 h-5 ${createTask ? 'text-amber-400' : 'text-white/20'}`} />
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.05] flex gap-3 bg-slate-900/50">
          <AnimatedButton
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white hover:bg-white/[0.06] transition-all font-medium"
          >
            Annuler
          </AnimatedButton>
          <AnimatedButton
            onClick={() => onSave({ ...formData, createTask })}
            disabled={!formData.title?.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium hover:from-cyan-600 hover:to-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/25"
          >
            {event ? 'Mettre à jour' : 'Créer l\'événement'}
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

// Close Button with animation - CSS natif
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white border border-white/10 transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-90"
    >
      <X className="w-4 h-4" />
    </button>
  );
}

// Animated Checkbox Component
function AnimatedCheckbox({
  checked,
  onChange,
  color = 'cyan'
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: 'cyan' | 'amber' | 'emerald';
}) {
  const checkRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (checked && checkRef.current) {
      gsap.fromTo(checkRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.2, ease: 'back.out(1.7)' }
      );
    }
  }, [checked]);

  const colorClasses = {
    cyan: 'bg-cyan-500 border-cyan-500',
    amber: 'bg-amber-500 border-amber-500',
    emerald: 'bg-emerald-500 border-emerald-500',
  };

  return (
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`w-5 h-5 rounded-md border transition-all ${checked ? colorClasses[color] : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}>
        {checked && (
          <svg
            ref={checkRef}
            className="w-5 h-5 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  );
}

// Add Button Component - CSS natif
function AddButton({ onClick, color = 'cyan' }: { onClick: () => void; color?: 'cyan' | 'emerald' }) {
  const colorClasses = {
    cyan: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border-cyan-500/20',
    emerald: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/20',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl border transition-all duration-150 hover:scale-105 active:scale-95 ${colorClasses[color]}`}
    >
      <Plus className="w-4 h-4" />
    </button>
  );
}

// Tag List Component
function TagList({
  items,
  onRemove,
  variant = 'default',
  prefix = ''
}: {
  items: string[];
  onRemove: (index: number) => void;
  variant?: 'default' | 'emerald';
  prefix?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const tags = containerRef.current.querySelectorAll('.tag-item');
      gsap.fromTo(tags,
        { scale: 0 },
        { scale: 1, duration: 0.2, stagger: 0.03, ease: 'back.out(1.7)' }
      );
    }
  }, [items]);

  const variantClasses = {
    default: 'bg-white/10 text-white border-white/10',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div ref={containerRef} className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className={`tag-item px-2.5 py-1 rounded-${variant === 'emerald' ? 'lg' : 'full'} text-xs flex items-center gap-1.5 border ${variantClasses[variant]}`}
        >
          {prefix}{item}
          <button onClick={() => onRemove(i)}>
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

// Animated Button - CSS natif
function AnimatedButton({
  children,
  onClick,
  disabled,
  className = ''
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} transition-transform duration-150 ease-out hover:scale-[1.01] active:scale-[0.99] disabled:hover:scale-100`}
    >
      {children}
    </button>
  );
}

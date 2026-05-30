'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  X, Plus, Trash2, Calendar, Clock, Target, CheckCircle2,
  Sparkles, GripVertical, Save, Loader2, AlertCircle, Sunrise, Sunset
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore, Task, TaskChapter, Category } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task | null;
}

const priorityOptions = [
  { value: 'low', label: 'Basse', emoji: '🟢', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'medium', label: 'Moyenne', emoji: '🟡', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'high', label: 'Haute', emoji: '🔴', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
];

export default function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const { categories } = useStore();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [categoryId, setCategoryId] = useState('cat-professional');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [chapters, setChapters] = useState<TaskChapter[]>([]);
  const [observations, setObservations] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // New chapter input
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // New category input
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📋');
  const [newCategoryColor, setNewCategoryColor] = useState('emerald');

  // GSAP refs
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const newCategoryRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const chaptersContainerRef = useRef<HTMLDivElement>(null);

  const popularIcons = ['📋', '🏃', '📚', '💼', '🧘', '🎨', '🎵', '✈️', '🏠', '❤️', '💡', '🎯'];
  const colorOptions = ['emerald', 'violet', 'cyan', 'amber', 'rose', 'blue', 'orange', 'slate'];

  // GSAP Animation for modal open/close
  useEffect(() => {
    if (isOpen) {
      // Animate overlay
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
      );
      // Animate modal
      gsap.fromTo(modalRef.current,
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  // GSAP Animation for errors
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      gsap.fromTo(errorRef.current,
        { opacity: 0, height: 0 },
        { opacity: 1, height: 'auto', duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [errors]);

  // GSAP Animation for new category form
  useEffect(() => {
    if (showNewCategory && newCategoryRef.current) {
      gsap.fromTo(newCategoryRef.current,
        { opacity: 0, height: 0 },
        { opacity: 1, height: 'auto', duration: 0.25, ease: 'power2.out' }
      );
    }
  }, [showNewCategory]);

  // GSAP Animation for progress bar
  useEffect(() => {
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: `${progress}%`,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  }, [progress]);

  // Initialize form when editing or reset for new
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setCategoryId(task.categoryId);
      setStartDate(task.startDate ? task.startDate.split('T')[0] : '');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setProgress(task.progress || 0);
      setChapters(task.chapters || []);
      setObservations(task.observations || '');
      setAddToCalendar(task.addToCalendar || false);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategoryId('cat-professional');
      setStartDate('');
      setDueDate('');
      setProgress(0);
      setChapters([]);
      setObservations('');
      setAddToCalendar(false);
    }
    setErrors([]);
    setShowNewCategory(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [task, isOpen]);

  // Auto-calculate progress from chapters
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (chapters.length > 0) {
      const completed = chapters.filter(c => c.completed).length;
      setProgress(Math.round((completed / chapters.length) * 100));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [chapters]);

  // Add chapter with GSAP animation
  const handleAddChapter = useCallback(() => {
    if (newChapterTitle.trim()) {
      const newChapter = {
        id: `chapter-${Date.now()}`,
        title: newChapterTitle.trim(),
        completed: false,
        order: chapters.length,
      };
      setChapters(prev => [...prev, newChapter]);
      setNewChapterTitle('');
    }
  }, [newChapterTitle, chapters.length]);

  // Toggle chapter
  const toggleChapter = (id: string) => {
    setChapters(chapters.map(c =>
      c.id === id ? { ...c, completed: !c.completed } : c
    ));
  };

  // Delete chapter with GSAP animation
  const deleteChapter = useCallback((id: string) => {
    const chapterEl = document.getElementById(`chapter-${id}`);
    if (chapterEl) {
      gsap.to(chapterEl, {
        opacity: 0,
        x: 10,
        duration: 0.2,
        onComplete: () => {
          setChapters(prev => prev.filter(c => c.id !== id));
        }
      });
    } else {
      setChapters(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  // Create category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          icon: newCategoryIcon,
          color: newCategoryColor,
          type: 'task',
        }),
      });
      const data = await res.json();
      if (data.category) {
        setCategoryId(data.category.id);
        setShowNewCategory(false);
        setNewCategoryName('');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  // Validate & save
  const handleSave = async () => {
    const newErrors: string[] = [];

    if (!title.trim()) {
      newErrors.push('Le titre est obligatoire');
    }

    if (addToCalendar && !startDate) {
      newErrors.push('Une date de démarrage est requise pour synchroniser avec le calendrier');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors([]);

    try {
      await onSave({
        id: task?.id,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        categoryId,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        progress,
        chapters: chapters.length > 0 ? chapters : undefined,
        observations: observations.trim() || undefined,
        addToCalendar,
        createdBy: 'user',
        status: task?.status || 'pending',
      });

      // Close animation
      gsap.to(modalRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 20,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose
      });
    } catch (error) {
      setErrors(['Une erreur est survenue lors de la sauvegarde']);
    } finally {
      setIsSaving(false);
    }
  };

  // Close with animation
  const handleCloseWithAnimation = useCallback(() => {
    gsap.to(modalRef.current, {
      scale: 0.95,
      opacity: 0,
      y: 20,
      duration: 0.2,
      ease: 'power2.in'
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: onClose
    });
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseWithAnimation();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleCloseWithAnimation]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={handleCloseWithAnimation}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col relative
                   bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]
                   shadow-2xl shadow-black/30 shadow-emerald-500/10
                   before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.07] before:via-transparent before:to-transparent before:pointer-events-none before:rounded-2xl
                   after:absolute after:inset-0 after:bg-gradient-to-br after:from-emerald-500/5 after:via-transparent after:to-cyan-500/5 after:pointer-events-none after:rounded-2xl"
      >
        {/* === HEADER === */}
        <div className="relative z-10 flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {task ? '✏️ Modifier la Tâche' : '✨ Nouvelle Tâche'}
              </h2>
              <p className="text-xs text-slate-400">
                {task ? 'Mettez à jour les informations' : 'Remplissez les détails ci-dessous'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseWithAnimation}
            className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* === CONTENT === */}
        <div className="relative z-10 flex-1 overflow-y-auto p-5 space-y-5">
          {/* Errors */}
          {errors.length > 0 && (
            <div
              ref={errorRef}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30"
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
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Finaliser le rapport trimestriel"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-white/[0.07] focus:outline-none transition-all"
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
              placeholder="Décrivez cette tâche..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-white/[0.07] focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Priorité
              </label>
              <div className="flex gap-1.5">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value as 'low' | 'medium' | 'high')}
                    className={cn(
                      "flex-1 px-2 py-2 rounded-lg text-xs font-medium border transition-all",
                      priority === opt.value
                        ? opt.color
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Catégorie
              </label>
              <div className="flex gap-2">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 focus:outline-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-800">
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                  title="Nouvelle catégorie"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* New Category Form */}
          {showNewCategory && (
            <div ref={newCategoryRef} className="overflow-hidden">
              <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nom..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                  />
                  <div className="flex gap-1">
                    {popularIcons.slice(0, 6).map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewCategoryIcon(icon)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          newCategoryIcon === icon ? "bg-emerald-500/30 ring-1 ring-emerald-500" : "bg-white/5 hover:bg-white/10"
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Couleur:</span>
                  <div className="flex gap-1">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategoryColor(color)}
                        className={cn(
                          "w-5 h-5 rounded-full transition-all",
                          `bg-${color}-500`,
                          newCategoryColor === color && "ring-2 ring-white ring-offset-1 ring-offset-slate-800"
                        )}
                      />
                    ))}
                  </div>
                  <Button onClick={handleCreateCategory} size="sm" className="ml-auto">
                    Créer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Dates - Style Premium */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Dates de la Tâche
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Date de début */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sunrise className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs text-cyan-300 font-medium uppercase tracking-wider">Début</span>
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-lg font-bold text-white bg-transparent border-0 focus:outline-none focus:ring-0"
                />
              </div>
              {/* Date d'échéance */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sunset className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Échéance</span>
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-lg font-bold text-white bg-transparent border-0 focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Progression
              </label>
              <span className="text-lg font-bold text-emerald-400">{progress}%</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                ref={progressBarRef}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                style={{ width: '0%' }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1"
            />
          </div>

          {/* Chapters */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              Étapes ({chapters.filter(c => c.completed).length}/{chapters.length})
            </label>

            <div ref={chaptersContainerRef} className="space-y-2 max-h-40 overflow-y-auto">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  id={`chapter-${chapter.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10 group"
                  style={{ opacity: 1 }}
                >
                  <GripVertical className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 cursor-grab" />
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0",
                      chapter.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-white/20 hover:border-emerald-500/50"
                    )}
                  >
                    {chapter.completed && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <span className={cn(
                    "flex-1 text-sm truncate",
                    chapter.completed ? "text-slate-500 line-through" : "text-white"
                  )}>
                    {chapter.title}
                  </span>
                  <button
                    onClick={() => deleteChapter(chapter.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddChapter()}
                placeholder="Ajouter une étape..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none transition-all"
              />
              <button
                onClick={handleAddChapter}
                className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Observations
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Notes, réflexions, commentaires..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Calendar Sync */}
          <label className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 cursor-pointer hover:border-cyan-500/40 transition-all group">
            <input
              type="checkbox"
              checked={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-white group-hover:text-cyan-100 transition-colors">
                📅 Ajouter au calendrier
              </span>
              <p className="text-xs text-slate-400">
                Synchroniser automatiquement avec votre calendrier
              </p>
            </div>
            <Calendar className="w-5 h-5 text-cyan-400" />
          </label>
        </div>

        {/* === FOOTER === */}
        <div className="relative z-10 flex items-center justify-between gap-3 p-4 border-t border-white/10 bg-slate-900/50">
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
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
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
                {task ? 'Mettre à jour' : 'Créer la tâche'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

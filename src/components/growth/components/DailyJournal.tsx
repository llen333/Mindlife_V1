// Composant pour le journal quotidien guidé
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Heart, Lightbulb, Target, Sparkles, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GrowthJournal, CreateJournalInput } from '../types';

interface DailyJournalProps {
  journals: GrowthJournal[];
  onSave: (input: CreateJournalInput) => Promise<boolean>;
  isLoading?: boolean;
}

const MOOD_EMOJIS = ['😢', '😔', '😐', '😊', '😄'];
const MOOD_LABELS = ['Très bas', 'Bas', 'Neutre', 'Bien', 'Excellent'];

export function DailyJournal({ journals, onSave, isLoading }: DailyJournalProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [currentDate, setCurrentDate] = useState(today);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [gratitude, setGratitude] = useState<string[]>(['', '', '']);
  const [wins, setWins] = useState<string[]>(['']);
  const [lessons, setLessons] = useState<string[]>(['']);
  const [priorities, setPriorities] = useState<string[]>(['', '', '']);
  const [reflection, setReflection] = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [nevilleRevision, setNevilleRevision] = useState('');
  const [saving, setSaving] = useState(false);

  // Load journal for current date
  useEffect(() => {
    const journal = journals.find(j => {
      const jDate = new Date(j.date);
      jDate.setHours(0, 0, 0, 0);
      return jDate.getTime() === currentDate.getTime();
    });

    // Use setTimeout to defer setState calls outside the effect
    const timer = setTimeout(() => {
      if (journal) {
        setMood(journal.mood as 1 | 2 | 3 | 4 | 5);
        setGratitude(journal.gratitude?.length === 3 ? journal.gratitude : ['', '', '']);
        setWins(journal.wins?.length > 0 ? journal.wins : ['']);
        setLessons(journal.lessons?.length > 0 ? journal.lessons : ['']);
        setPriorities(journal.priorities?.length === 3 ? journal.priorities : ['', '', '']);
        setReflection(journal.reflection || '');
        setAffirmation(journal.affirmation || '');
        setNevilleRevision(journal.nevilleRevision || '');
      } else {
        // Reset form
        setMood(3);
        setGratitude(['', '', '']);
        setWins(['']);
        setLessons(['']);
        setPriorities(['', '', '']);
        setReflection('');
        setAffirmation('');
        setNevilleRevision('');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [currentDate, journals]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      mood,
      gratitude: gratitude.filter(g => g.trim()),
      wins: wins.filter(w => w.trim()),
      lessons: lessons.filter(l => l.trim()),
      priorities: priorities.filter(p => p.trim()),
      reflection: reflection || undefined,
      affirmation: affirmation || undefined,
      nevilleRevision: nevilleRevision || undefined,
    }, currentDate);
    setSaving(false);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    if (newDate <= today) {
      setCurrentDate(newDate);
    }
  };

  const formatDate = (date: Date) => {
    const isToday = date.getTime() === today.getTime();
    if (isToday) return "Aujourd'hui";
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          Journal de Croissance
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-300 min-w-[150px] text-center">
            {formatDate(currentDate)}
          </span>
          <button
            onClick={() => navigateDate('next')}
            disabled={currentDate.getTime() >= today.getTime()}
            className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mood */}
      <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/5">
        <label className="text-sm font-medium text-slate-300 mb-3 block">Comment te sens-tu?</label>
        <div className="flex justify-between">
          {MOOD_EMOJIS.map((emoji, i) => (
            <button
              key={i}
              onClick={() => setMood((i + 1) as 1 | 2 | 3 | 4 | 5)}
              className={`
                flex flex-col items-center p-3 rounded-xl transition-all
                ${mood === i + 1 
                  ? 'bg-purple-500/20 border border-purple-500/40' 
                  : 'hover:bg-slate-700/30'
                }
              `}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs text-slate-400 mt-1">{MOOD_LABELS[i]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gratitude */}
      <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/5">
        <label className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          3 choses pour lesquelles tu es reconnaissant(e)
        </label>
        <div className="space-y-2">
          {gratitude.map((g, i) => (
            <input
              key={i}
              type="text"
              value={g}
              onChange={(e) => {
                const newGratitude = [...gratitude];
                newGratitude[i] = e.target.value;
                setGratitude(newGratitude);
              }}
              placeholder={`${i + 1}. `}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-500 focus:border-purple-500/40 focus:outline-none transition-colors"
            />
          ))}
        </div>
      </div>

      {/* Wins */}
      <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/5">
        <label className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <span className="text-amber-400">🏆</span>
          Victoires du jour
        </label>
        <div className="space-y-2">
          {wins.map((w, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={w}
                onChange={(e) => {
                  const newWins = [...wins];
                  newWins[i] = e.target.value;
                  setWins(newWins);
                }}
                placeholder="Qu'as-tu accompli?"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-500 focus:border-amber-500/40 focus:outline-none transition-colors"
              />
              {i === wins.length - 1 && (
                <button
                  onClick={() => setWins([...wins, ''])}
                  className="px-4 py-2 rounded-xl bg-slate-700/30 text-slate-400 hover:text-white"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lessons */}
      <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/5">
        <label className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          Leçons apprises
        </label>
        <div className="space-y-2">
          {lessons.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={l}
                onChange={(e) => {
                  const newLessons = [...lessons];
                  newLessons[i] = e.target.value;
                  setLessons(newLessons);
                }}
                placeholder="Qu'as-tu appris?"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none transition-colors"
              />
              {i === lessons.length - 1 && (
                <button
                  onClick={() => setLessons([...lessons, ''])}
                  className="px-4 py-2 rounded-xl bg-slate-700/30 text-slate-400 hover:text-white"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Priorities for tomorrow */}
      <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/5">
        <label className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          3 priorités pour demain
        </label>
        <div className="space-y-2">
          {priorities.map((p, i) => (
            <input
              key={i}
              type="text"
              value={p}
              onChange={(e) => {
                const newPriorities = [...priorities];
                newPriorities[i] = e.target.value;
                setPriorities(newPriorities);
              }}
              placeholder={`${i + 1}. `}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-500 focus:border-emerald-500/40 focus:outline-none transition-colors"
            />
          ))}
        </div>
      </div>

      {/* Affirmation */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
        <label className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Affirmation du jour (Neville Goddard)
        </label>
        <textarea
          value={affirmation}
          onChange={(e) => setAffirmation(e.target.value)}
          placeholder="Je suis..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-purple-500/20 text-white placeholder-slate-500 focus:border-purple-500/40 focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Free Reflection */}
      <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/5">
        <label className="text-sm font-medium text-slate-300 mb-3">Réflexion libre</label>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Écris tes pensées..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-500 focus:border-slate-500/40 focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:from-purple-600 hover:to-violet-600 transition-all disabled:opacity-50"
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sauvegarde...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Sauvegarder le journal
          </span>
        )}
      </button>
    </div>
  );
}

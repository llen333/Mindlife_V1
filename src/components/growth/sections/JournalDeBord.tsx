// Journal de Bord - Carnet de bord personnel
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Plus, Save, Calendar, Clock, Sun, Moon, 
  Star, Target, CheckCircle2, AlertCircle, Sparkles,
  TrendingUp, Heart, Zap, ChevronRight, Edit2, Trash2,
  X, Lightbulb, ArrowRight
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface JournalEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  gratitudes: string[];
  wins: string[];
  challenges: string[];
  tomorrowIntentions: string[];
  energyLevel: number; // 1-10
  productivityLevel: number; // 1-10
  createdAt: Date;
  updatedAt: Date;
}

interface DailyAction {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: 'health' | 'mind' | 'productivity' | 'relationships' | 'spirit';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  completedAt?: Date;
}

// ============================================
// DONNÉES INITIALES
// ============================================

const sampleEntries: JournalEntry[] = [
  {
    id: 'entry-1',
    date: new Date(Date.now() - 86400000),
    title: 'Journée productive',
    content: 'Aujourd\'hui j\'ai réussi à terminer ma présentation pour le client. Je me sens satisfait de mon travail.',
    mood: 'great',
    gratitudes: ['Ma santé', 'Mon travail', 'Ma famille'],
    wins: ['Présentation terminée', 'Séance sport', 'Méditation matinale'],
    challenges: ['Gestion du temps sur les réseaux sociaux'],
    tomorrowIntentions: ['Commencer par les tâches importantes', 'Limiter les réseaux à 30 min'],
    energyLevel: 8,
    productivityLevel: 9,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'entry-2',
    date: new Date(Date.now() - 172800000),
    title: 'Journée calme',
    content: 'Journée plus repos. J\'ai pris le temps de lire et me reposer.',
    mood: 'good',
    gratitudes: ['Le temps pour moi', 'Un bon livre', 'Le soleil'],
    wins: ['Lecture 1h', 'Promenade', 'Cuisine saine'],
    challenges: ['Motivation le matin'],
    tomorrowIntentions: ['Routine matinale complète', 'Appeler maman'],
    energyLevel: 6,
    productivityLevel: 5,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
  },
];

const sampleActions: DailyAction[] = [
  {
    id: 'action-1',
    title: 'Méditation 15 min',
    description: 'Session de méditation guidée',
    completed: false,
    category: 'mind',
    priority: 'high',
  },
  {
    id: 'action-2',
    title: 'Lire 30 pages',
    description: 'Continuer Atomic Habits',
    completed: false,
    category: 'productivity',
    priority: 'medium',
  },
  {
    id: 'action-3',
    title: 'Exercice 30 min',
    description: 'Séance de musculation',
    completed: false,
    category: 'health',
    priority: 'high',
  },
  {
    id: 'action-4',
    title: 'Appeler un ami',
    description: 'Prendre des nouvelles',
    completed: false,
    category: 'relationships',
    priority: 'low',
  },
];

const MOOD_EMOJIS = {
  great: '😊',
  good: '🙂',
  neutral: '😐',
  bad: '😕',
  terrible: '😢',
};

const MOOD_COLORS = {
  great: 'text-emerald-400',
  good: 'text-green-400',
  neutral: 'text-yellow-400',
  bad: 'text-orange-400',
  terrible: 'text-red-400',
};

const CATEGORY_COLORS = {
  health: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
  mind: 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
  productivity: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
  relationships: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  spirit: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function JournalDeBord() {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [actions, setActions] = useState<DailyAction[]>(sampleActions);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  
  // New entry state
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    mood: 'good',
    gratitudes: ['', '', ''],
    wins: ['', '', ''],
    challenges: [''],
    tomorrowIntentions: ['', ''],
    energyLevel: 7,
    productivityLevel: 7,
  });

  // Get today's date
  const today = new Date();
  const todayStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  
  // Check if entry exists for today
  const todayEntry = entries.find(e => {
    const entryDate = new Date(e.date);
    return entryDate.toDateString() === today.toDateString();
  });

  // Stats
  const completedActions = actions.filter(a => a.completed).length;
  const streakDays = entries.length >= 2 ? 
    Math.floor((Date.now() - new Date(entries[entries.length - 1].date).getTime()) / 86400000) : 0;

  // Add new entry
  const handleAddEntry = () => {
    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: new Date(),
      title: newEntry.title || `Entrée du ${todayStr}`,
      content: newEntry.content || '',
      mood: newEntry.mood || 'good',
      gratitudes: newEntry.gratitudes?.filter(g => g.trim()) || [],
      wins: newEntry.wins?.filter(w => w.trim()) || [],
      challenges: newEntry.challenges?.filter(c => c.trim()) || [],
      tomorrowIntentions: newEntry.tomorrowIntentions?.filter(t => t.trim()) || [],
      energyLevel: newEntry.energyLevel || 7,
      productivityLevel: newEntry.productivityLevel || 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEntries([entry, ...entries]);
    setShowNewEntry(false);
    setNewEntry({
      title: '',
      content: '',
      mood: 'good',
      gratitudes: ['', '', ''],
      wins: ['', '', ''],
      challenges: [''],
      tomorrowIntentions: ['', ''],
      energyLevel: 7,
      productivityLevel: 7,
    });
  };

  // Toggle action
  const toggleAction = (id: string) => {
    setActions(actions.map(a => 
      a.id === id 
        ? { ...a, completed: !a.completed, completedAt: !a.completed ? new Date() : undefined }
        : a
    ));
  };

  // Add new action
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionCategory, setNewActionCategory] = useState<DailyAction['category']>('productivity');
  
  const addNewAction = () => {
    if (!newActionTitle.trim()) return;
    const action: DailyAction = {
      id: `action-${Date.now()}`,
      title: newActionTitle.trim(),
      category: newActionCategory,
      completed: false,
      priority: 'medium',
    };
    setActions([...actions, action]);
    setNewActionTitle('');
    setShowActionsModal(false);
  };

  return (
    <div className="col-span-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-light">Journal de Bord</h3>
            <p className="text-white/40 text-xs">{todayStr}</p>
          </div>
        </div>
        {!todayEntry && (
          <button
            onClick={() => setShowNewEntry(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle entrée
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-light text-white">{entries.length}</div>
          <div className="text-white/40 text-xs">Entrées</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-light text-amber-400">{streakDays}</div>
          <div className="text-white/40 text-xs">Jours suite</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-light text-emerald-400">{completedActions}/{actions.length}</div>
          <div className="text-white/40 text-xs">Actions</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-light text-purple-400">
            {entries.filter(e => e.mood === 'great' || e.mood === 'good').length}
          </div>
          <div className="text-white/40 text-xs">Bons jours</div>
        </div>
      </div>

      {/* Today's Actions */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-white/80 text-sm uppercase tracking-wider">Petites Actions du Jour</span>
          </div>
          <button
            onClick={() => setShowActionsModal(true)}
            className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {actions.map((action) => (
            <div
              key={action.id}
              onClick={() => toggleAction(action.id)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                action.completed 
                  ? 'bg-emerald-500/10 border border-emerald-500/20' 
                  : `bg-white/5 border border-white/10 hover:border-white/20`
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                action.completed 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : 'border-white/30'
              }`}>
                {action.completed && <CheckCircle2 className="w-4 h-4 text-black" />}
              </div>
              <span className={`flex-1 text-sm ${action.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                {action.title}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[action.category]}`}>
                {action.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-white/40" />
          <span className="text-white/60 text-xs uppercase tracking-wider">Entrées récentes</span>
        </div>
        
        {entries.slice(0, 3).map((entry) => (
          <div
            key={entry.id}
            onClick={() => setSelectedEntry(entry)}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{MOOD_EMOJIS[entry.mood]}</span>
                <span className="text-white font-light">{entry.title}</span>
              </div>
              <span className="text-white/30 text-xs">
                {new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <p className="text-white/50 text-sm line-clamp-2 mb-3">{entry.content}</p>
            <div className="flex items-center gap-4 text-xs">
              {entry.wins.length > 0 && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {entry.wins.length} victoires
                </span>
              )}
              {entry.gratitudes.length > 0 && (
                <span className="flex items-center gap-1 text-pink-400">
                  <Heart className="w-3 h-3" />
                  {entry.gratitudes.length} gratitudes
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-white/40 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* New Entry Modal */}
      {showNewEntry && (
        <JournalEntryModal
          entry={newEntry}
          onClose={() => setShowNewEntry(false)}
          onSave={handleAddEntry}
          onChange={setNewEntry}
        />
      )}

      {/* View Entry Modal */}
      {selectedEntry && (
        <JournalViewModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {/* Add Action Modal */}
      {showActionsModal && (
        <AddActionModal
          title={newActionTitle}
          category={newActionCategory}
          onTitleChange={setNewActionTitle}
          onCategoryChange={setNewActionCategory}
          onClose={() => setShowActionsModal(false)}
          onAdd={addNewAction}
        />
      )}
    </div>
  );
}

// ============================================
// JOURNAL ENTRY MODAL
// ============================================

interface JournalEntryModalProps {
  entry: Partial<JournalEntry>;
  onClose: () => void;
  onSave: () => void;
  onChange: (entry: Partial<JournalEntry>) => void;
}

function JournalEntryModal({ entry, onClose, onSave, onChange }: JournalEntryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const updateField = <K extends keyof JournalEntry>(field: K, value: JournalEntry[K]) => {
    onChange({ ...entry, [field]: value });
  };

  const updateArray = (field: 'gratitudes' | 'wins' | 'challenges' | 'tomorrowIntentions', index: number, value: string) => {
    const arr = [...(entry[field] || [])] as string[];
    arr[index] = value;
    onChange({ ...entry, [field]: arr });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/10"
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-white">Nouvelle entrée</h2>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mood */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider mb-3 block">Humeur du jour</label>
            <div className="flex gap-2">
              {(Object.keys(MOOD_EMOJIS) as Array<JournalEntry['mood']>).map((mood) => (
                <button
                  key={mood}
                  onClick={() => updateField('mood', mood)}
                  className={`flex-1 p-3 rounded-xl text-center transition-all ${
                    entry.mood === mood 
                      ? 'bg-white/20 border border-white/30' 
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">{MOOD_EMOJIS[mood]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Titre</label>
            <input
              type="text"
              value={entry.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Résumé de la journée..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/30 outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Contenu</label>
            <textarea
              value={entry.content || ''}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="Qu'avez-vous vécu aujourd'hui ?"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/30 outline-none resize-none"
            />
          </div>

          {/* Gratitude */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              Gratitude (3 choses)
            </label>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={entry.gratitudes?.[i] || ''}
                  onChange={(e) => updateArray('gratitudes', i, e.target.value)}
                  placeholder={`${i + 1}. Je suis reconnaissant pour...`}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/30 outline-none text-sm"
                />
              ))}
            </div>
          </div>

          {/* Wins */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Victoires du jour
            </label>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={entry.wins?.[i] || ''}
                  onChange={(e) => updateArray('wins', i, e.target.value)}
                  placeholder={`${i + 1}. J'ai réussi à...`}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/30 outline-none text-sm"
                />
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Défis rencontrés
            </label>
            <input
              type="text"
              value={entry.challenges?.[0] || ''}
              onChange={(e) => updateArray('challenges', 0, e.target.value)}
              placeholder="Ce qui m'a posé problème..."
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/30 outline-none text-sm"
            />
          </div>

          {/* Energy & Productivity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Énergie: {entry.energyLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={entry.energyLevel || 5}
                onChange={(e) => updateField('energyLevel', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Productivité: {entry.productivityLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={entry.productivityLevel || 5}
                onChange={(e) => updateField('productivityLevel', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
            >
              Annuler
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-light"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VIEW ENTRY MODAL
// ============================================

interface JournalViewModalProps {
  entry: JournalEntry;
  onClose: () => void;
}

function JournalViewModal({ entry, onClose }: JournalViewModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{MOOD_EMOJIS[entry.mood]}</span>
              <div>
                <h2 className="text-xl font-light text-white">{entry.title}</h2>
                <p className="text-white/40 text-sm">
                  {new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {entry.content && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/70">{entry.content}</p>
            </div>
          )}

          {/* Gratitude */}
          {entry.gratitudes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                Gratitude
              </h3>
              <div className="space-y-2">
                {entry.gratitudes.map((g, i) => (
                  <div key={i} className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-white/80 text-sm">
                    {g}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wins */}
          {entry.wins.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Victoires
              </h3>
              <div className="flex flex-wrap gap-2">
                {entry.wins.map((w, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-400 text-xs uppercase tracking-wider mb-2">
                <Zap className="w-4 h-4" />
                Énergie
              </div>
              <div className="text-2xl font-light text-white">{entry.energyLevel}/10</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-wider mb-2">
                <TrendingUp className="w-4 h-4" />
                Productivité
              </div>
              <div className="text-2xl font-light text-white">{entry.productivityLevel}/10</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ADD ACTION MODAL
// ============================================

interface AddActionModalProps {
  title: string;
  category: DailyAction['category'];
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: DailyAction['category']) => void;
  onClose: () => void;
  onAdd: () => void;
}

function AddActionModal({ title, category, onTitleChange, onCategoryChange, onClose, onAdd }: AddActionModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-light text-white mb-4">Nouvelle Action</h2>
        
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Nom de l'action..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/30 outline-none"
            autoFocus
          />
          
          <div className="flex flex-wrap gap-2">
            {(['health', 'mind', 'productivity', 'relationships', 'spirit'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  category === cat
                    ? `bg-gradient-to-r ${CATEGORY_COLORS[cat]}`
                    : 'bg-white/5 border border-white/10 text-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60"
            >
              Annuler
            </button>
            <button
              onClick={onAdd}
              disabled={!title.trim()}
              className="flex-1 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 disabled:opacity-30"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalDeBord;

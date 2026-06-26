// GrowthPage - Main Personal Development Page
'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles, Plus, Target, Brain, Briefcase, BookOpen,
  TrendingUp, ChevronDown, ChevronUp, Filter, Search, Youtube
} from 'lucide-react';
import MindLifeHeader from '../MindLifeHeader';
import { AddModal } from './modals';

// Sections
import { EvolutionsRoutinesSection } from './sections/EvolutionsRoutinesSection';
import { PersonalDevelopmentSection } from './sections/PersonalDevelopmentSection';
import { ProfessionalSection } from './sections/ProfessionalSection';
import { PsycheSection } from './sections/PsycheSection';
import { YouTubeAISection } from './sections/YouTubeAISection';

// Data & Types
import { 
  initialRoutines, 
  initialGoals, 
  personalResources, 
  professionalProjects,
  psycheResources,
  mentalCards,
  spiritualityPractices,
  growthCategories
} from './constants';
import type { GrowthRoutine, GrowthGoal, PersonalResource } from './types';
import { getYouTubeId } from './utils';

const DELETED_STATIC_KEY = 'mindlife_deleted_static_resources';

function getDeletedStaticIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_STATIC_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function addDeletedStaticId(id: string) {
  try {
    const ids = getDeletedStaticIds();
    ids.add(id);
    localStorage.setItem(DELETED_STATIC_KEY, JSON.stringify([...ids]));
  } catch {}
}

export default function GrowthPage() {
  // State - filter out previously deleted static resources on init
  const [routines, setRoutines] = useState<GrowthRoutine[]>(initialRoutines);
  const [goals, setGoals] = useState<GrowthGoal[]>(initialGoals);
  const [resources, setResources] = useState<PersonalResource[]>(() => {
    if (typeof window === 'undefined') return personalResources;
    const deleted = getDeletedStaticIds();
    return personalResources.filter(r => !deleted.has(r.id));
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'routine' | 'goal' | 'resource' | 'project' | 'psyche'>('routine');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    routines: true,
    personal: true,
    youtube: true,
    professional: true,
    psyche: true,
  });

  // Charger les ressources depuis SQLite
  useEffect(() => {
    const loadDbResources = async () => {
      try {
        const res = await fetch('/api/media-items?userId=mindlife-user');
        if (res.ok) {
          const { items } = await res.json();
          if (items && items.length > 0) {
            // Convertir les MediaItem en PersonalResource
            const dbResources: PersonalResource[] = items.map((item: any) => ({
              id: item.id,
              title: item.title,
              author: item.author || 'Chaîne YouTube',
              type: item.type as any,
              status: (item.type === 'video' ? 'to-watch' : item.type === 'audio' ? 'to-listen' : 'reading') as any,
              category: 'mindset',
              imageUrl: item.imageUrl || undefined,
              url: item.url,
              description: item.description || undefined,
              rating: item.isFavorite ? 5 : undefined,
              progress: 0,
              tags: item.category ? item.category.split(',').map((t: string) => t.trim()) : ['croissance'],
              createdAt: new Date(item.createdAt),
            }));

            // Fusionner avec les ressources par défaut
            // DB resources win over static/temp ones - deduplicate by ID AND URL
            setResources(prev => {
              const staticFiltered = prev.filter(r => 
                !dbResources.some(d => d.id === r.id || (r.url && d.url && r.url === d.url))
              );
              return [...dbResources, ...staticFiltered];
            });
          }
        }
      } catch (error) {
        console.error('Erreur de chargement des ressources SQLite:', error);
      }
    };
    loadDbResources();
  }, []);

  // Handlers
  const handleCompleteRoutine = (id: string) => {
    setRoutines(prev => prev.map(r => 
      r.id === id 
        ? { ...r, currentStreak: r.currentStreak + 1, totalCompletions: r.totalCompletions + 1, lastCompletedAt: new Date() }
        : r
    ));
  };

  const handleUpdateGoal = (id: string, value: number) => {
    setGoals(prev => prev.map(g => 
      g.id === id 
        ? { ...g, currentValue: value, progress: Math.round((value / (g.targetValue || 100)) * 100), updatedAt: new Date() }
        : g
    ));
  };

  const handleUpdateResource = async (id: string, data: Partial<PersonalResource>) => {
    setResources(prev => prev.map(r => 
      r.id === id ? { ...r, ...data } : r
    ));

    // Persister la mise à jour dans SQLite
    try {
      await fetch('/api/media-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: data.title,
          author: data.author,
          url: data.url,
          imageUrl: data.imageUrl,
          description: data.description,
          isFavorite: data.rating && data.rating >= 4 ? true : undefined,
          category: data.tags && data.tags.length > 0 ? data.tags.join(',') : undefined,
          type: data.type,
        }),
      });
    } catch (e) {
      console.error('Erreur lors de la sauvegarde SQLite:', e);
    }
  };

  const handleCreateResource = async (newResource: PersonalResource) => {
    // 1. Optimistic UI update with temporary ID
    setResources(prev => [newResource, ...prev]);

    // 2. Persist to SQLite via POST
    try {
      const response = await fetch('/api/media-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'mindlife-user',
          title: newResource.title,
          author: newResource.author,
          type: newResource.type,
          url: newResource.url,
          imageUrl: newResource.imageUrl,
          description: newResource.description,
          source: 'growth',
          category: newResource.tags && newResource.tags.length > 0 ? newResource.tags.join(',') : 'croissance',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.item && data.item.id) {
          // Replace the temporary client ID with the actual database ID
          setResources(prev => prev.map(r => 
            r.id === newResource.id ? { ...r, id: data.item.id } : r
          ));
        }
      } else {
        console.error('Failed to save resource to SQLite:', await response.text());
      }
    } catch (e) {
      console.error('Erreur lors de la création SQLite:', e);
    }
  };

  const handleDeleteResource = async (id: string) => {
    // 1. Save the item before removing it (for rollback)
    const itemToDelete = resources.find(r => r.id === id);
    
    // 2. Optimistic UI update
    setResources(prev => prev.filter(r => r.id !== id));
    
    // 3. If it's a static resource (not a DB media-XXXX id), blacklist it in localStorage
    const isStaticResource = !id.startsWith('media-');
    if (isStaticResource) {
      addDeletedStaticId(id);
      // No DB call needed for static resources - they were never in DB
      return;
    }
    
    // 4. Database deletion with rollback on failure (only for real DB resources)
    try {
      const response = await fetch(`/api/media-items?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // Rollback: restore item in UI if DB deletion failed
        console.error('Erreur lors de la suppression SQLite - rollback');
        if (itemToDelete) {
          setResources(prev => [itemToDelete, ...prev]);
        }
      }
    } catch (e) {
      console.error('Erreur lors de la suppression SQLite:', e);
      // Rollback on network error
      if (itemToDelete) {
        setResources(prev => [itemToDelete, ...prev]);
      }
    }
  };

  const handleAddNew = (type: typeof addModalType) => {
    setAddModalType(type);
    setShowAddModal(true);
  };

  const handleSaveNew = async (data: any) => {
    if (addModalType === 'resource') {
      const ytId = data.url ? getYouTubeId(data.url) : null;
      const imageUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined;

      const newResource: PersonalResource = {
        id: `resource-${Date.now()}`,
        title: data.title || 'Sans titre',
        author: data.author || 'Chaîne YouTube',
        type: data.type || 'video',
        status: (data.type === 'video' ? 'to-watch' : data.type === 'audio' ? 'to-listen' : 'reading') as any,
        category: data.category || 'mindset',
        imageUrl: imageUrl,
        url: data.url || '',
        description: data.description || '',
        progress: 0,
        tags: ['croissance', data.type || 'video'],
        createdAt: new Date(),
      };
      await handleCreateResource(newResource);
    }
    setShowAddModal(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 overflow-x-hidden">
      {/* Nebula Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 10% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(34, 197, 94, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
          `,
          filter: 'blur(100px)',
        }}
      />

      {/* Header */}
      <MindLifeHeader
        title="MindLife"
        subtitle="Croissance & Développement Personnel"
        icon={TrendingUp}
        theme="emerald"
        showBackButton={true}
        rightContent={
          <nav className="hidden lg:flex gap-6 text-[10px] uppercase tracking-[0.2em] font-light text-slate-400">
            <button
              onClick={() => document.getElementById('routines')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-emerald-500 transition-colors"
            >
              Routines
            </button>
            <button
              onClick={() => document.getElementById('personal')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-blue-500 transition-colors"
            >
              Personnel
            </button>
            <button
              onClick={() => document.getElementById('youtube')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-red-500 transition-colors"
            >
              YouTube AI
            </button>
            <button
              onClick={() => document.getElementById('professional')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-purple-500 transition-colors"
            >
              Professionnel
            </button>
            <button
              onClick={() => document.getElementById('psyche')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-pink-500 transition-colors"
            >
              Psyché
            </button>
          </nav>
        }
      />

      {/* Main Content */}
      <main className="pt-24 pb-64 px-4 lg:px-8 max-w-[1600px] mx-auto space-y-16 relative z-10">
        
        {/* Section 1: Évolutions & Routines */}
        <section id="routines">
          <EvolutionsRoutinesSection
            routines={routines}
            goals={goals}
            onCompleteRoutine={handleCompleteRoutine}
            onUpdateGoal={handleUpdateGoal}
          />
        </section>

        {/* Section 2: Personal Development */}
        <section id="personal">
          <PersonalDevelopmentSection
            resources={resources}
            onUpdateResource={handleUpdateResource}
            onCreateResource={handleCreateResource}
            onDeleteResource={handleDeleteResource}
            onAddNewResource={() => handleAddNew('resource')}
          />
        </section>

        {/* Section 2.5: YouTube AI */}
        <section id="youtube" className="extreme-glass rounded-2xl p-6">
          <YouTubeAISection />
        </section>

        {/* Section 3: Professional Development */}
        <section id="professional">
          <ProfessionalSection
            projects={professionalProjects}
            techWatch={[]}
            contacts={[]}
            costs={[]}
            activityLogs={[]}
          />
        </section>

        {/* Section 4: Psyche Development */}
        <section id="psyche">
          <PsycheSection
            resources={psycheResources}
            mentalCards={mentalCards}
            practices={spiritualityPractices}
          />
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4">
        <button
          onClick={() => handleAddNew('routine')}
          className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-all"
          title="Nouvelle Routine"
        >
          <Target className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleAddNew('goal')}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
          title="Nouvel Objectif"
        >
          <Plus className="w-7 h-7" />
        </button>

        <button
          onClick={() => handleAddNew('resource')}
          className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition-all"
          title="Nouvelle Ressource"
        >
          <BookOpen className="w-5 h-5" />
        </button>
      </div>

      {/* Add Modal */}
      <AddModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        type={addModalType}
        onSave={handleSaveNew}
      />

      {/* Global Styles */}
      <style jsx global>{`
        .extreme-glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(32px) saturate(120%);
          -webkit-backdrop-filter: blur(32px) saturate(120%);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .extreme-glass:hover {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
        }
        .glass-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .glass-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
          border-radius: 10px;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

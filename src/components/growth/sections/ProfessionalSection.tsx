// Section 3: Professional Development - Avec Cards Flip
'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Briefcase, Rocket, DollarSign, Lightbulb, Target, TrendingUp,
  ChevronRight, Calendar, Clock, ExternalLink, Edit2, Plus,
  Check, AlertCircle, Zap, Users, BarChart3, FileText,
  GitBranch, Package, Settings, ArrowRight, X, Save
} from 'lucide-react';
import type { ProfessionalProject, TechWatch, ProfessionalContact, BusinessCost, DailyActivityLog } from '../types';

interface ProfessionalSectionProps {
  projects: ProfessionalProject[];
  techWatch: TechWatch[];
  contacts: ProfessionalContact[];
  costs: BusinessCost[];
  activityLogs: DailyActivityLog[];
}

export function ProfessionalSection({ 
  projects, 
  techWatch: initialTechWatch, 
  contacts: initialContacts, 
  costs: initialCosts,
  activityLogs 
}: ProfessionalSectionProps) {
  const [selectedProject, setSelectedProject] = useState<ProfessionalProject | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'watch' | 'contacts' | 'finances'>('projects');
  
  // Local state for editable data
  const [techWatch, setTechWatch] = useState<TechWatch[]>([
    {
      id: 'tw-1',
      title: 'Next.js 15 avec Turbopack',
      source: 'Vercel Blog',
      url: 'https://nextjs.org/blog',
      summary: 'Turbopack améliore les performances de build de 700x',
      category: 'Framework',
      relevance: 'high',
      status: 'new',
      createdAt: new Date(),
    },
    {
      id: 'tw-2',
      title: 'React 19 Server Components',
      source: 'React Blog',
      url: 'https://react.dev/blog',
      summary: 'Les Server Components deviennent stables dans React 19',
      category: 'React',
      relevance: 'high',
      status: 'new',
      createdAt: new Date(),
    },
    {
      id: 'tw-3',
      title: 'Bun 1.2 - Runtime JavaScript',
      source: 'Bun Blog',
      url: 'https://bun.sh/blog',
      summary: 'Alternative rapide à Node.js avec support natif TypeScript',
      category: 'Runtime',
      relevance: 'medium',
      status: 'new',
      createdAt: new Date(),
    },
    {
      id: 'tw-4',
      title: 'Tailwind CSS 4.0',
      source: 'Tailwind Labs',
      url: 'https://tailwindcss.com/blog',
      summary: 'Nouveau moteur CSS avec performances améliorées',
      category: 'CSS',
      relevance: 'medium',
      status: 'new',
      createdAt: new Date(),
    },
    {
      id: 'tw-5',
      title: 'Claude 3.5 Sonnet',
      source: 'Anthropic',
      url: 'https://anthropic.com',
      summary: 'Nouveau modèle IA avec capacités avancées de raisonnement',
      category: 'IA',
      relevance: 'high',
      status: 'read',
      createdAt: new Date(),
    },
  ]);
  
  const [contacts, setContacts] = useState<ProfessionalContact[]>([
    {
      id: 'c-1',
      name: 'Marie Dupont',
      company: 'Tech Solutions',
      role: 'CTO',
      email: 'marie@techsolutions.com',
      linkedin: 'linkedin.com/in/mariedupont',
      tags: ['Tech', 'Startup'],
      lastContact: new Date(Date.now() - 604800000),
      nextFollowUp: new Date(Date.now() + 604800000),
    },
    {
      id: 'c-2',
      name: 'Pierre Martin',
      company: 'Invest Corp',
      role: 'Investisseur',
      email: 'pierre@investcorp.com',
      tags: ['Finance', 'Investment'],
      lastContact: new Date(Date.now() - 1209600000),
    },
    {
      id: 'c-3',
      name: 'Sophie Laurent',
      company: 'Design Studio',
      role: 'Designer UI/UX',
      email: 'sophie@designstudio.com',
      tags: ['Design', 'UI/UX'],
      lastContact: new Date(Date.now() - 259200000),
    },
  ]);
  
  const [costs, setCosts] = useState<BusinessCost[]>([
    {
      id: 'cost-1',
      title: 'Hébergement Vercel',
      amount: 20,
      category: 'fixed',
      frequency: 'monthly',
      date: new Date(),
    },
    {
      id: 'cost-2',
      title: 'Domaine + SSL',
      amount: 15,
      category: 'fixed',
      frequency: 'yearly',
      date: new Date(),
    },
    {
      id: 'cost-3',
      title: 'Abonnement Figma',
      amount: 12,
      category: 'fixed',
      frequency: 'monthly',
      date: new Date(),
    },
    {
      id: 'cost-4',
      title: 'API OpenAI',
      amount: 50,
      category: 'variable',
      frequency: 'monthly',
      date: new Date(),
    },
  ]);

  // Calculer les dépenses mensuelles
  const monthlyCosts = costs.reduce((acc, cost) => {
    if (cost.frequency === 'monthly') return acc + cost.amount;
    if (cost.frequency === 'yearly') return acc + (cost.amount / 12);
    return acc;
  }, 0);

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/20 to-gray-500/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-light text-white tracking-wide">Développement Professionnel</h2>
            <p className="text-white/40 text-sm">Projets, veille et contacts professionnels</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-400 text-sm hover:bg-slate-500/20 transition-colors">
          <Plus className="w-4 h-4" />
          Nouveau projet
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'projects', label: 'Projets', count: projects.length, icon: Briefcase },
          { id: 'watch', label: 'Veille', count: techWatch.filter(t => t.status === 'new').length, icon: Lightbulb },
          { id: 'contacts', label: 'Contacts', count: contacts.length, icon: Users },
          { id: 'finances', label: 'Finances', count: costs.length, icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap backdrop-blur-sm ${
                activeTab === tab.id
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Projects Tab - Avec Cards Flip */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-12 gap-4">
          {projects.map((project) => (
            <ProjectFlipCard 
              key={project.id} 
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
          {projects.length === 0 && (
            <div className="col-span-12 text-center py-12 text-white/30">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              Aucun projet actif
            </div>
          )}
        </div>
      )}

      {/* Tech Watch Tab */}
      {activeTab === 'watch' && (
        <div className="space-y-3">
          {techWatch.map((item) => (
            <TechWatchCard key={item.id} item={item} onMarkRead={(id) => 
              setTechWatch(techWatch.map(t => t.id === id ? { ...t, status: 'read' } : t))
            } />
          ))}
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-12 gap-4">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}

      {/* Finances Tab */}
      {activeTab === 'finances' && (
        <div>
          {/* Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/60 text-xs uppercase tracking-wider">Dépenses mensuelles</div>
                <div className="text-3xl font-light text-white mt-1">{monthlyCosts.toFixed(0)} €</div>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-400/30" />
            </div>
          </div>
          
          {/* Costs list */}
          <div className="space-y-2">
            {costs.map((cost) => (
              <div key={cost.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="text-white">{cost.title}</div>
                  <div className="text-white/40 text-xs">{cost.frequency}</div>
                </div>
                <div className="text-white font-light">{cost.amount} €</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}

// ============================================
// PROJECT FLIP CARD
// ============================================

interface ProjectFlipCardProps {
  project: ProfessionalProject;
  onClick: () => void;
}

function ProjectFlipCard({ project, onClick }: ProjectFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const typeIcons = {
    business: Briefcase,
    'side-project': Rocket,
    investment: DollarSign,
    skill: Lightbulb,
  };
  const Icon = typeIcons[project.type] || Target;

  const statusColors = {
    idea: 'from-slate-500/20 to-gray-500/20 border-slate-500/30',
    planning: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    active: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    paused: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
    completed: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  };

  const statusLabels = {
    idea: 'Idée',
    planning: 'Planification',
    active: 'Actif',
    paused: 'En pause',
    completed: 'Terminé',
  };

  return (
    <div 
      className="col-span-12 md:col-span-6 lg:col-span-4"
      style={{ perspective: '1000px' }}
    >
      <div
        className={`relative w-full h-64 transition-transform duration-500 cursor-pointer`}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
          style={{ 
            backfaceVisibility: 'hidden',
            background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
          }}
        >
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${statusColors[project.status]} border backdrop-blur-sm`} />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white/60" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                project.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                project.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                'bg-white/10 text-white/50'
              }`}>
                {project.priority}
              </span>
            </div>
            <h4 className="text-white font-light text-lg">{project.title}</h4>
            <p className="text-white/40 text-sm mt-1 line-clamp-2">{project.description}</p>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-xs">{statusLabels[project.status]}</span>
              <span className="text-white text-sm">{project.progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 rounded-2xl p-5"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,20,0.95))',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="h-full flex flex-col justify-between">
            <div>
              <h4 className="text-white font-light mb-3">{project.title}</h4>
              <div className="space-y-2 text-sm">
                {project.budget && (
                  <div className="flex justify-between text-white/60">
                    <span>Budget:</span>
                    <span className="text-white">{project.budget.toLocaleString()} €</span>
                  </div>
                )}
                {project.spent && (
                  <div className="flex justify-between text-white/60">
                    <span>Dépensé:</span>
                    <span className="text-white">{project.spent.toLocaleString()} €</span>
                  </div>
                )}
                {project.roi && (
                  <div className="flex justify-between text-white/60">
                    <span>ROI:</span>
                    <span className="text-emerald-400">{project.roi}%</span>
                  </div>
                )}
                {project.startDate && (
                  <div className="flex justify-between text-white/60">
                    <span>Début:</span>
                    <span className="text-white">
                      {new Date(project.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {project.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">
                  {tag}
                </span>
              ))}
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="w-full py-2 rounded-xl bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              Voir détails
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PROJECT DETAIL MODAL
// ============================================

interface ProjectDetailModalProps {
  project: ProfessionalProject;
  onClose: () => void;
}

function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // Sample chapters for project
  const chapters = [
    { id: 'ch-1', title: 'Recherche & Analyse', completed: true, tasks: 5 },
    { id: 'ch-2', title: 'Design UI/UX', completed: true, tasks: 8 },
    { id: 'ch-3', title: 'Développement Frontend', completed: false, tasks: 12, progress: 60 },
    { id: 'ch-4', title: 'Développement Backend', completed: false, tasks: 10, progress: 30 },
    { id: 'ch-5', title: 'Tests & QA', completed: false, tasks: 6 },
    { id: 'ch-6', title: 'Déploiement', completed: false, tasks: 4 },
  ];

  const completedChapters = chapters.filter(c => c.completed).length;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-white/60" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    project.status === 'planning' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {project.status}
                  </span>
                  <span className="text-white/40 text-xs">{project.type}</span>
                </div>
                <h2 className="text-2xl font-light text-white tracking-wide">{project.title}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/70">{project.description}</p>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl font-light text-white">{project.progress}%</div>
              <div className="text-white/40 text-xs mt-1">Progression</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl font-light text-emerald-400">{completedChapters}/{chapters.length}</div>
              <div className="text-white/40 text-xs mt-1">Chapitres</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl font-light text-white">
                {project.budget ? `${(project.spent || 0).toLocaleString()}€` : '-'}
              </div>
              <div className="text-white/40 text-xs mt-1">Dépensé</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl font-light text-amber-400">
                {project.roi ? `${project.roi}%` : '-'}
              </div>
              <div className="text-white/40 text-xs mt-1">ROI</div>
            </div>
          </div>

          {/* MVP Section */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-xs uppercase tracking-wider">MVP - Minimum Viable Product</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-emerald-400" />
                Authentification utilisateur
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="w-4 h-4 text-emerald-400" />
                Dashboard principal
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Gestion des tâches (en cours)
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <div className="w-4 h-4 rounded-full border border-white/20" />
                Export des données
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div>
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Chapitres de progression
            </h3>
            <div className="space-y-2">
              {chapters.map((chapter, i) => (
                <div 
                  key={chapter.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    chapter.completed 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : chapter.progress 
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        chapter.completed ? 'bg-emerald-500 text-black' : 'bg-white/10'
                      }`}>
                        {chapter.completed ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      <div>
                        <div className={chapter.completed ? 'text-white/60 line-through' : 'text-white'}>
                          {chapter.title}
                        </div>
                        <div className="text-white/40 text-xs">{chapter.tasks} tâches</div>
                      </div>
                    </div>
                    {chapter.progress && !chapter.completed && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${chapter.progress}%` }}
                          />
                        </div>
                        <span className="text-white/60 text-xs">{chapter.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Chronologie
            </h3>
            <div className="flex gap-4">
              {project.startDate && (
                <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-white/40 text-xs">Date de début</div>
                  <div className="text-white mt-1">
                    {new Date(project.startDate).toLocaleDateString('fr-FR', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </div>
                </div>
              )}
              {project.endDate && (
                <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-white/40 text-xs">Date de fin prévue</div>
                  <div className="text-white mt-1">
                    {new Date(project.endDate).toLocaleDateString('fr-FR', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/60 text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ============================================
// TECH WATCH CARD
// ============================================

interface TechWatchCardProps {
  item: TechWatch;
  onMarkRead: (id: string) => void;
}

function TechWatchCard({ item, onMarkRead }: TechWatchCardProps) {
  const relevanceColors = {
    high: 'border-rose-500/30 bg-rose-500/10',
    medium: 'border-amber-500/30 bg-amber-500/10',
    low: 'border-white/10 bg-white/5',
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${relevanceColors[item.relevance]}`}>
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
        <Lightbulb className="w-5 h-5 text-white/60" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-light">{item.title}</span>
          {item.status === 'new' && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs">Nouveau</span>
          )}
        </div>
        <p className="text-white/40 text-sm mt-1 line-clamp-1">{item.summary}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
          <span>{item.source}</span>
          <span>•</span>
          <span>{item.category}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        {item.status === 'new' && (
          <button
            onClick={() => onMarkRead(item.id)}
            className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// CONTACT CARD
// ============================================

interface ContactCardProps {
  contact: ProfessionalContact;
}

function ContactCard({ contact }: ContactCardProps) {
  const daysSinceLastContact = contact.lastContact 
    ? Math.floor((Date.now() - new Date(contact.lastContact).getTime()) / 86400000)
    : null;

  return (
    <div className="col-span-12 md:col-span-6 lg:col-span-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-white/60">
          {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-light">{contact.name}</div>
          <div className="text-white/40 text-sm">{contact.role} @ {contact.company}</div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mt-3">
        {contact.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs">
            {tag}
          </span>
        ))}
      </div>

      {daysSinceLastContact !== null && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-white/40">
            Dernier contact: {daysSinceLastContact === 0 ? "Aujourd'hui" : `Il y a ${daysSinceLastContact}j`}
          </span>
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="text-blue-400 hover:underline"
            >
              Contacter
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfessionalSection;

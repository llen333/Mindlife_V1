'use client';

import { useState, useEffect } from 'react';
import { X, Save, Lock, Globe, Zap, Database, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_SKILLS, ROLE_BASE_SKILLS, ROLE_BASE_LABELS, skillDef } from '@/lib/agent-skills';

const BLUE = '#3b82f6';

interface Agent {
  id: string; name: string; role: string; capabilities: string[];
  provider: string; model: string; mode: string; isActive: boolean;
  systemPrompt?: string | null; tone?: string | null;
  memoriesCount?: number; sessionsCount?: number;
}

interface SkillModalProps {
  agent: Agent;
  onClose: () => void;
  onSave: (agentId: string, capabilities: string[]) => Promise<void>;
}

const CAPABILITY_ICONS: Record<string, any> = {
  conversation: Brain, analysis: Brain, reflection: Brain, spiritual_guidance: Sparkles,
  training: Zap, nutrition: Zap, motivation: Zap, program_design: Zap,
  meal_planning: Database, nutrition_advice: Database, recipes: Database, diet_tracking: Database,
  strategic_advice: Globe, decision_help: Globe,
  task_management: Zap, calendar: Database, prioritization: Zap, workflow_optimization: Zap,
  general_help: Brain, information: Globe, brainstorming: Sparkles,
  listening: Brain, emotional_support: Brain, casual_conversation: Brain, advice: Brain,
  philosophy: Brain, wisdom: Brain, meditation: Sparkles,
};

const CATEGORIES = [
  { id: 'base', label: 'Fondamentales', icon: Lock, color: '#3b82f6' },
  { id: 'web', label: 'Web & Recherche', icon: Globe, color: '#06b6d4' },
  { id: 'data', label: 'Données & Analyse', icon: Database, color: '#22c55e' },
  { id: 'productivity', label: 'Productivité', icon: Zap, color: '#f97316' },
  { id: 'creative', label: 'Créatif', icon: Sparkles, color: '#a855f7' },
];

function skillColor(skillId: string): string {
  const d = skillDef(skillId);
  if (!d) return 'rgba(148,163,184,0.3)';
  switch (d.category) {
    case 'web': return 'rgba(6,182,212,0.3)';
    case 'data': return 'rgba(34,197,94,0.3)';
    case 'productivity': return 'rgba(249,115,22,0.3)';
    case 'creative': return 'rgba(168,85,247,0.3)';
    default: return 'rgba(59,130,246,0.3)';
  }
}

function skillTextColor(skillId: string): string {
  const d = skillDef(skillId);
  if (!d) return 'text-slate-400';
  switch (d.category) {
    case 'web': return 'text-cyan-400';
    case 'data': return 'text-emerald-400';
    case 'productivity': return 'text-orange-400';
    case 'creative': return 'text-violet-400';
    default: return 'text-blue-400';
  }
}

function skillBorderColor(skillId: string): string {
  const d = skillDef(skillId);
  if (!d) return 'rgba(148,163,184,0.2)';
  switch (d.category) {
    case 'web': return 'rgba(6,182,212,0.2)';
    case 'data': return 'rgba(34,197,94,0.2)';
    case 'productivity': return 'rgba(249,115,22,0.2)';
    case 'creative': return 'rgba(168,85,247,0.2)';
    default: return 'rgba(59,130,246,0.2)';
  }
}

export default function SkillManager({ agent, onClose, onSave }: SkillModalProps) {
  const [optionalSkills, setOptionalSkills] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const baseSkills = ROLE_BASE_SKILLS[agent.role] || [];
  const baseLabels = ROLE_BASE_LABELS[agent.role] || baseSkills;

  useEffect(() => {
    const current = new Set(agent.capabilities || []);
    const optional = new Set<string>();
    for (const cap of current) {
      if (!baseSkills.includes(cap)) {
        optional.add(cap);
      }
    }
    setOptionalSkills(optional);
  }, [agent]);

  const toggleOptional = (skillId: string) => {
    setOptionalSkills(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const allCaps = [...baseSkills, ...Array.from(optionalSkills)];
    await onSave(agent.id, allCaps);
    setSaving(false);
    onClose();
  };

  const optionalSkillsList = Object.values(ALL_SKILLS).filter(s => !baseSkills.includes(s.id));
  const categorizedOptional = CATEGORIES.slice(1).map(cat => ({
    ...cat,
    skills: optionalSkillsList.filter(s => s.category === cat.id),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div className="relative w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto custom-scrollbar animate-modal-content-in"
        style={{
          background: 'rgba(11, 13, 20, 0.95)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '24px',
          boxShadow: `0 0 60px rgba(59,130,246,0.08), inset 0 1px 1px rgba(255,255,255,0.02)`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 border-b border-white/[0.04]"
          style={{ background: 'rgba(11,13,20,0.95)' }}
        >
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight"
              style={{ textShadow: `0 0 30px ${BLUE}44` }}>Compétences</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {agent.name} · <span className="text-blue-400">{agent.role}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Base Skills */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Compétences de base</h3>
              <span className="text-[10px] text-slate-600 font-mono">(Rôle {agent.role})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {baseSkills.map((skillId, i) => {
                const CapIcon = CAPABILITY_ICONS[skillId] || Brain;
                return (
                  <div key={skillId} className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.04] opacity-80"
                    style={{
                      background: 'rgba(18, 18, 23, 0.4)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <CapIcon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">{baseLabels[i]}</div>
                      <div className="text-[9px] text-slate-600 uppercase tracking-wider font-mono">{skillId.replace(/_/g, ' ')}</div>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Optional Skills */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Compétences optionnelles</h3>
              <span className="text-[10px] text-slate-600 font-mono">({optionalSkills.size} activée{optionalSkills.size > 1 ? 's' : ''})</span>
            </div>

            <div className="flex gap-1 mb-4 flex-wrap">
              <button onClick={() => setActiveTab('all')}
                className={cn("px-3 py-1.5 rounded-lg text-[10px] font-medium font-mono uppercase tracking-wider transition-all border",
                  activeTab === 'all'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                )}>Tout</button>
              {categorizedOptional.filter(c => c.skills.length > 0).map(cat => (
                <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                  className={cn("px-3 py-1.5 rounded-lg text-[10px] font-medium font-mono uppercase tracking-wider transition-all border",
                    activeTab === cat.id
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                  )}>{cat.label}</button>
              ))}
            </div>

            <div className="space-y-1.5">
              {(activeTab === 'all' ? optionalSkillsList : optionalSkillsList.filter(s => s.category === activeTab)).map(skill => {
                const enabled = optionalSkills.has(skill.id);
                const d = skillDef(skill.id);
                return (
                  <button key={skill.id} onClick={() => toggleOptional(skill.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 text-left group"
                    style={{
                      background: enabled
                        ? `linear-gradient(135deg, ${skillColor(skill.id)} 0%, rgba(18,18,23,0.6) 100%)`
                        : 'rgba(18, 18, 23, 0.3)',
                      borderColor: enabled ? skillBorderColor(skill.id) : 'rgba(255,255,255,0.04)',
                      boxShadow: enabled ? `0 0 20px ${skillColor(skill.id)}` : 'none',
                    }}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all",
                      enabled
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white/5 border-white/10 group-hover:bg-white/10'
                    )}>
                      <span className="text-lg">{skill.icon || '⚡'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium transition-colors", enabled ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')}>
                          {skill.label}
                        </span>
                        {skill.id === 'web_search' && (
                          <span className="text-[8px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-full border border-cyan-500/20 uppercase tracking-wider font-mono font-medium">Recommandé</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600">{skill.description}</span>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                      enabled
                        ? 'border-cyan-400 bg-cyan-400/20'
                        : 'border-white/10 group-hover:border-white/20'
                    )}>
                      {enabled && <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400" style={{ boxShadow: '0 0 8px rgba(6,182,212,0.6)' }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 pt-4 border-t border-white/[0.04]"
          style={{ background: 'rgba(11,13,20,0.95)' }}
        >
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-slate-200 transition-all font-medium">
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${BLUE}, #06b6d4)`,
              boxShadow: `0 0 20px ${BLUE}44`,
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}

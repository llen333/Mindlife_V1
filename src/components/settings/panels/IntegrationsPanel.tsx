'use client';

import { Link2, FileText, Globe, Webhook, Database, CheckCircle2, XCircle, Clock, ChevronRight, Plug, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const BLUE = '#3b82f6';
const CYAN = '#06b6d4';

const INTEGRATIONS = [
  { name: 'Web Search', desc: 'Recherche d\'informations en ligne', status: 'active' as const,
    icon: Globe, color: 'text-blue-400', category: 'Connectivité' },
  { name: 'Web Scraping', desc: 'Extraction de contenu web', status: 'active' as const,
    icon: Webhook, color: 'text-blue-400', category: 'Connectivité' },
  { name: 'Base de connaissances', desc: 'Corpus et données personnelles', status: 'active' as const,
    icon: Database, color: 'text-cyan-400', category: 'Données' },
  { name: 'OpenAI', desc: 'Modèles GPT-4, GPT-4o (désactivé)', status: 'inactive' as const,
    icon: Plug, color: 'text-slate-500', category: 'LLM' },
  { name: 'Anthropic', desc: 'Modèles Claude (désactivé)', status: 'inactive' as const,
    icon: Plug, color: 'text-slate-500', category: 'LLM' },
  { name: 'Convex', desc: 'Base de données temps réel (désactivé)', status: 'inactive' as const,
    icon: Database, color: 'text-slate-500', category: 'Infrastructure' },
];

const STATUS_META = {
  active: { icon: CheckCircle2, label: 'Actif', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]' },
  inactive: { icon: XCircle, label: 'Inactif', class: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
};

const GLOW = `0 0 40px ${BLUE}11`;

const CATEGORIES = [...new Set(INTEGRATIONS.map(i => i.category))];

const QUICK_ACTIONS = [
  { label: 'Connecter un service', desc: 'Nouvelle API externe', icon: Plug },
  { label: 'Synchroniser données', desc: 'Base de connaissances', icon: RefreshCw },
];

export default function IntegrationsPanel() {
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <div className="space-y-8 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30"
          style={{ background: `radial-gradient(circle, ${BLUE}22, transparent 70%)` }}
        />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20"
          style={{ background: `radial-gradient(circle, ${CYAN}1A, transparent 70%)` }}
        />
      </div>

      <header className="flex items-start justify-between relative z-10">
        <div>
          <h1 className="font-serif text-5xl text-white mb-3 tracking-tight"
            style={{ textShadow: `0 0 40px ${BLUE}44` }}>
            Intégrations
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.08em] font-mono font-medium">Services connectés et API externes</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-white uppercase tracking-[0.08em] font-mono font-medium">{date}</span>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6 relative z-10">
        <div className="col-span-2 space-y-6">
          {CATEGORIES.map(cat => (
            <div key={cat} className="space-y-3">
              <h2 className="text-[10px] text-slate-500 uppercase tracking-[0.08em] font-mono font-medium">{cat}</h2>
              <div className="space-y-3">
                {INTEGRATIONS.filter(i => i.category === cat).map(integration => {
                  const status = STATUS_META[integration.status];
                  return (
                    <div
                      key={integration.name}
                      className="relative p-5 rounded-[20px] border border-white/[0.06] transition-all duration-500 hover:border-blue-500/30 group"
                      style={{
                        background: 'rgba(18, 18, 23, 0.6)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: `inset 0 1px 1px rgba(255,255,255,0.02), ${GLOW}`,
                      }}
                    >
                      <div className="absolute -top-8 -right-8 w-24 h-24 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity"
                        style={{ background: `radial-gradient(circle, ${BLUE}33, transparent)` }}
                      />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <integration.icon className={cn("w-5 h-5", integration.color)} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{integration.name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{integration.desc}</div>
                          </div>
                        </div>
                        <div className={cn("flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg border", status.class)}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div
            className="rounded-[24px] border border-white/[0.06] p-8 transition-all duration-500 hover:border-blue-500/20"
            style={{
              background: 'rgba(18, 18, 23, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: `inset 0 1px 1px rgba(255,255,255,0.02), ${GLOW}`,
            }}
          >
            <h2 className="text-[10px] text-slate-400 uppercase tracking-[0.08em] font-mono font-medium mb-6">Actions Rapides</h2>
            <div className="space-y-3">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  className="w-full bg-white/[0.03] border border-white/[0.05] p-5 text-left rounded-2xl transition-all duration-300 group hover:border-blue-500/40"
                  style={{ boxShadow: `0 0 0px ${BLUE}00`, transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${BLUE}22` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0px ${BLUE}00` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <action.icon className="w-4 h-4 text-slate-400 transition-colors duration-300 group-hover:text-blue-400" />
                      <p className="text-sm font-semibold text-white transition-colors duration-300 group-hover:text-blue-400">{action.label}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 transition-colors duration-300 group-hover:text-blue-400" />
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.08em] font-mono">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-[24px] p-6 relative overflow-hidden group border border-white/10 transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${BLUE}1A 0%, ${CYAN}0D 100%)`,
              boxShadow: `0 0 30px ${BLUE}22`,
            }}
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 blur-3xl transition-all"
              style={{ background: `${BLUE}33`, opacity: 0.6 }}
            />
            <p className="text-[10px] uppercase tracking-[0.08em] font-mono font-medium mb-2"
              style={{ color: CYAN }}>API Premium</p>
            <p className="text-sm text-white mb-4 leading-relaxed font-light">Accédez à la gamme complète d&apos;intégrations avec le plan Pro.</p>
            <button
              className="text-[10px] font-mono text-white px-4 py-2 rounded-lg transition-all font-medium"
              style={{
                background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
                boxShadow: `0 0 20px ${BLUE}44`,
              }}
            >Voir les offres</button>
          </div>
        </div>
      </div>
    </div>
  );
}

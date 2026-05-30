'use client';

import { useState } from 'react';
import {
  Bot, MessageSquare, LayoutDashboard, Database,
  ChevronRight, Plus, Calendar, Zap, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BLUE = '#3b82f6';
const CYAN = '#06b6d4';

const AGENT_IMAGES: Record<string, string> = {
  Atlas: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx84oLAYHYFLFWWyJ7RG88kfnOsL-HVOnI0KoJJ9DZtF-3wFgRRZ8YAmtjm2rRekGiOJ2IZdwxQpxRgXTY1iDMXWEP5Ngm_iil4caXU9YELSwfjgF6DjBYscXRyHfLVfpX-mw8lJ6Yjr33OVzCwV1pijnTn6ZcnXX4_30wlCpD9-PTnTkgsnt-1ZvdzBxSFQQDtnMs3I1sqrfmkVk5n0_hSqqQFtbrbvmGVVEBnjxFDDSegqX1l-OhPqSDXVPCFTaLnDlWmlTPjZI',
  Miam: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD916veW3qsBV9yoMX1rdMrZ53pgHt3_itq-MS_WVACs4rsXP9QkC0tQbfsdJWAImP5bv68sGZ8VBli-X2gTENKlhWlv0RcRY9ma0RdExzKtV2qX42P2pb6gP6XTyVsbarchNTr7qS9vkXOWhkUrERFGfO78EehcmTlB8H_fh_a0W0zIq7TxY1tnxiQiha-uU_UiE9aOks-kqxoNiG-5r3ZGkDB_DidHrXFlRu6x4Edskn1CNsENyX3ue2095zncCEeRDJn0GKyZcU',
  Psyché: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkAOiwwWwsRx_hPjxrUFDR7inmaKt9Q6CmkeJstxGjACK_BKixMW_ryZbzjPhlVl7SJ_tHsSV0mzWVfOE_GFh5gy_s_WfPuVLZuXjDc9ylC-JWQ-IsyUdOhmxm5-i_WarDhSv3K30QY07BIBTtiNOQSNI7dDmiNEx67U8oPAlsgVaP8OJrF0f6P8Yqad-CjwLXWpeV5TGEShz5L7FPeOCtjTs6ApxoDXljj0Vo3_OyjNGjIvF2Iw6PwvtTGhzEQLMv5uOECDtHVLM',
  Pyxos: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhbu1bxjNNw6Z5E4DPrKWoJMemfMhE5pPakRnfKMEA2uKE3wVntx90LfEvVXsbJJA8hmt6y8wugPmvslGdPR8uQWhUpH69MpX1CW8_4zbVfWIWkzEsvglHAEepfoOkgxJ0u68Vh76cLreyr1XcP1O9j-EV8s1RwyZ6A-ONZZ5-S5jWrxK_2FmKh2dcdQ8FIpxdJxckx-0BDI3wXOIx4XePrzlkshsmGfe97_2DRCmpHqMlPzehPRJMaufm8cN8HEBFGTOxj-M6fq4',
  Somnia: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEIX6D-zT7uE6xZnT8xn8eyoJ5dcl5GMdnf010PHlKDnmxs8CNnLU9CQybuydULaD_Hw4k32VxC79sTnvCCRTykbn3jCgyNVf4Xu055rLrcNjUxLcPXQG5IXTi1n1lNEDDnrmCM8tOjrRrGcLEp2DRGnLcgSYe8_-hNW_VH2_VOALRXKQ4wWcAuRSYA6UDP-kbr1RC-iPfmAdNWYTEEiQLHMqu7eHf5H0k27GrTbjVytB-RKr5vgYZegRkU_JxPhIO_3JeLSwivc4',
  Zéphyr: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzr8YTxoLmx-FDAUs0kpiWmZn479GkINFOs2cGSZnAirda_Fvvn6aCRx8-p0r3Ew8l3W-S9spjZLbREFadhIthPjEQ5a-VKZmIz8JiIcR3Usr1NtcDfSpicUt_Tu1AOynKhmsiJhnnQeIsxf5qJ8L_dTasZ3bWJVZzRnMsFVDh-m5N_wu6BOPrggMEFpWWHwWVjijemsNxl5MwLOY7jyOh97yaLBUuZCakWsUayxeztySjqXupSGC3z2s7NuicfKdNkWp4Celj_XU',
  Ami: 'https://images.unsplash.com/photo-1758600432914-2b5f4483c7b8?auto=format&fit=crop&w=600&h=800&q=80',
  Stoïcien: 'https://images.unsplash.com/photo-1758691032219-4e071fe08ac9?auto=format&fit=crop&w=600&h=800&q=80',
};

const AGENT_STYLE: Record<string, { color: string; overlay: string; neon: string; label: string }> = {
  coach:       { color: 'text-blue-400', overlay: 'bg-blue-500/10', neon: 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]', label: 'coach' },
  nutrition:   { color: 'text-cyan-400', overlay: 'bg-cyan-500/10', neon: 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]', label: 'nutrition' },
  psychologist:{ color: 'text-indigo-400', overlay: 'bg-indigo-500/10', neon: 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.8)]', label: 'psychologist' },
  oracle:      { color: 'text-sky-400', overlay: 'bg-sky-500/10', neon: 'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]', label: 'oracle' },
  assistant:   { color: 'text-violet-400', overlay: 'bg-violet-500/10', neon: 'bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]', label: 'assistant' },
  organization:{ color: 'text-slate-300', overlay: 'bg-slate-400/10', neon: 'bg-slate-300 shadow-[0_0_12px_rgba(203,213,225,0.8)]', label: 'organization' },
};

function getStyle(role: string) {
  return AGENT_STYLE[role.toLowerCase()] || { color: 'text-blue-400', overlay: 'bg-blue-500/10', neon: 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]', label: role };
}

interface Agent { id: string; name: string; role: string; isActive: boolean; }
interface Stats { agents: number; memories: number; sessions: number; messages: number; }

const AGENT_METRICS: Record<string, { label: string; value: string }[]> = {
  Atlas:     [{ label: 'Sync Rate', value: '98.4%' }, { label: 'Task Acc.', value: '99.1%' }, { label: 'Endurance', value: 'Peak' }, { label: 'Empathy', value: 'Lvl 4' }],
  Miam:      [{ label: 'Sync Rate', value: '94.2%' }, { label: 'Task Acc.', value: '96.5%' }, { label: 'Creativity', value: 'High' }, { label: 'Empathy', value: 'Lvl 7' }],
  Psyché:    [{ label: 'Sync Rate', value: '99.9%' }, { label: 'Task Acc.', value: '98.8%' }, { label: 'IQ Level', value: '145' }, { label: 'Empathy', value: 'Max' }],
  Pyxos:     [{ label: 'Sync Rate', value: '91.0%' }, { label: 'Task Acc.', value: '99.9%' }, { label: 'Logic', value: 'Absolute' }, { label: 'Empathy', value: 'Lvl 2' }],
  Somnia:    [{ label: 'Sync Rate', value: '96.7%' }, { label: 'Task Acc.', value: '95.2%' }, { label: 'Calmness', value: 'Optimal' }, { label: 'Empathy', value: 'Lvl 8' }],
  Zéphyr:    [{ label: 'Sync Rate', value: '98.0%' }, { label: 'Task Acc.', value: '99.5%' }, { label: 'Efficiency', value: 'Max' }, { label: 'Empathy', value: 'Lvl 5' }],
  Ami:       [{ label: 'Sync Rate', value: '97.3%' }, { label: 'Task Acc.', value: '98.2%' }, { label: 'Listening', value: 'Max' }, { label: 'Empathy', value: 'Lvl 10' }],
  Stoïcien:  [{ label: 'Sync Rate', value: '95.8%' }, { label: 'Task Acc.', value: '97.4%' }, { label: 'Wisdom', value: 'Infinite' }, { label: 'Empathy', value: 'Lvl 6' }],
};

export default function DashboardPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats>({ agents: 0, memories: 0, sessions: 0, messages: 0 });
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    fetch('/api/agent-service?action=agents').then(r => r.json()).then(d => {
      if (d.success && Array.isArray(d.agents)) {
        setAgents(d.agents);
        setStats(p => ({ ...p, agents: d.agents.length }));
        d.agents.forEach((a: Agent) => {
          fetch(`/api/agent-service?action=stats&agentId=${a.id}`).then(r => r.json()).then(s => {
            if (s.success) setStats(p => ({ ...p, memories: p.memories + s.stats.memories, sessions: p.sessions + s.stats.sessions, messages: p.messages + s.stats.messages }));
          });
        });
      }
    }).catch(() => {});
    setLoaded(true);
  }

  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();

  const STATS = [
    { label: 'AGENTS', value: stats.agents, trend: '+12.4%', icon: Bot },
    { label: 'SOUVENIRS', value: stats.memories, trend: '', icon: Database },
    { label: 'SESSIONS', value: stats.sessions, trend: '', icon: LayoutDashboard },
    { label: 'MESSAGES', value: stats.messages, trend: '', icon: MessageSquare },
  ];

  const ACTIONS = [
    { label: 'Discuter avec un agent', desc: 'Assistant chat', icon: Bot },
    { label: 'Configurer un provider', desc: 'API keys', icon: Zap },
    { label: 'Mon profil', desc: 'Informations', icon: FileText },
  ];

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
            Tableau de bord
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.08em] font-mono font-medium">État général du système MindLife</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-white uppercase tracking-[0.08em] font-mono font-medium">{date}</span>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-6 relative z-10">
        {STATS.map((s, i) => (
          <div
            key={i}
            className="relative p-7 rounded-[24px] border border-white/[0.06] overflow-hidden group hover:border-blue-500/30 transition-all duration-500"
            style={{
              background: 'rgba(18, 18, 23, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: i === 0 ? `inset 0 1px 1px rgba(255,255,255,0.02), 0 0 30px ${BLUE}22` : 'inset 0 1px 1px rgba(255,255,255,0.02)',
            }}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ background: i === 0 ? `radial-gradient(circle, ${BLUE}55, transparent)` : i === 3 ? `radial-gradient(circle, ${CYAN}44, transparent)` : 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)' }}
            />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center"
                style={{
                  background: i === 0 ? `${BLUE}1A` : 'rgba(255,255,255,0.05)',
                  borderColor: i === 0 ? `${BLUE}33` : 'rgba(255,255,255,0.1)',
                  boxShadow: i === 0 ? `0 0 20px ${BLUE}33` : 'none',
                }}
              >
                <s.icon className="w-5 h-5" style={{ color: i === 0 ? BLUE : undefined }} />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.08em] font-mono font-medium">{s.label}</span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-4xl font-mono text-white font-medium">{s.value}</span>
              {s.trend && <span className="text-[10px] font-mono font-medium" style={{ color: BLUE }}>{s.trend}</span>}
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-3 gap-6 relative z-10">
        <section className="col-span-2">
          <div
            className="rounded-[24px] border border-white/[0.06] p-8 h-full transition-all duration-500 hover:border-blue-500/20"
            style={{
              background: 'rgba(18, 18, 23, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: `inset 0 1px 1px rgba(255,255,255,0.02), 0 0 40px ${BLUE}11`,
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[10px] text-slate-400 uppercase tracking-[0.08em] font-mono font-medium">Agents Disponibles</h2>
              <button className="text-[10px] font-mono hover:underline"
                style={{ color: BLUE }}>Voir tout</button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {agents.length === 0 ? (
                <div className="col-span-2 p-12 text-center text-slate-500 text-sm">Chargement des agents...</div>
              ) : agents.map((agent) => {
                const s = getStyle(agent.role);
                const metrics = AGENT_METRICS[agent.name] || [{ label: 'Sync Rate', value: '95.0%' }, { label: 'Task Acc.', value: '97.0%' }, { label: 'Performance', value: 'Optimal' }, { label: 'Empathy', value: 'Lvl 5' }];
                const img = AGENT_IMAGES[agent.name];

                return (
                  <div
                    key={agent.id}
                    className="relative overflow-hidden rounded-2xl border border-white/10 group cursor-pointer h-72 flex flex-col justify-end p-6 transition-all duration-500 hover:border-blue-400/40"
                    style={{ boxShadow: `0 0 0px ${BLUE}00`, transition: 'all 0.4s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${BLUE}44` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0px ${BLUE}00` }}
                  >
                    <div className="absolute inset-0 z-0">
                      <img
                        alt={agent.name}
                        src={img}
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
                      <div className={cn("absolute inset-0 mix-blend-overlay group-hover:opacity-20 transition-opacity duration-500", s.overlay)} />
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", s.neon)} />
                    </div>
                    <div className="relative z-10 w-full">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-serif text-2xl text-white transition-colors"
                            style={{ textShadow: `0 0 20px ${BLUE}33` }}>
                            {agent.name}
                          </h3>
                          <p className={cn("text-[10px] uppercase tracking-[0.08em] font-mono font-medium", s.color)}>{agent.role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                        {metrics.map((m, i) => (
                          <div key={i}>
                            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">{m.label}</div>
                            <div className="text-xs text-white font-mono mt-0.5">{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div
            className="rounded-[24px] border border-white/[0.06] p-8 flex-1 transition-all duration-500 hover:border-blue-500/20"
            style={{
              background: 'rgba(18, 18, 23, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: `inset 0 1px 1px rgba(255,255,255,0.02), 0 0 40px ${BLUE}11`,
            }}
          >
            <h2 className="text-[10px] text-slate-400 uppercase tracking-[0.08em] font-mono font-medium mb-6">Actions Rapides</h2>
            <div className="space-y-4">
              {ACTIONS.map((action) => (
                <button
                  key={action.label}
                  className="w-full bg-white/[0.03] border border-white/[0.05] p-6 text-left rounded-2xl transition-all duration-300 group hover:border-blue-500/40"
                  style={{ boxShadow: `0 0 0px ${BLUE}00`, transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${BLUE}22` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0px ${BLUE}00` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white transition-colors duration-300 group-hover:text-blue-400">{action.label}</p>
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
              style={{ color: CYAN }}>MindLife Pro</p>
            <p className="text-sm text-white mb-4 leading-relaxed font-light">Analysez vos performances cognitives avec nos nouveaux agents spécialisés.</p>
            <button
              className="text-[10px] font-mono text-white px-4 py-2 rounded-lg transition-all font-medium"
              style={{
                background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
                boxShadow: `0 0 20px ${BLUE}44`,
              }}
            >Upgrade Now</button>
          </div>
        </section>
      </div>

      <button
        className="fixed bottom-10 right-12 w-16 h-16 rounded-full flex items-center justify-center text-white z-50 transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
          boxShadow: `0 0 30px ${BLUE}66, 0 0 60px ${BLUE}33`,
        }}
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </button>
    </div>
  );
}

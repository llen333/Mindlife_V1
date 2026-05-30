'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bot, Plus, Brain, Zap, Flame, Calendar, MessageSquare,
  Search, X, Edit3, Trash2, Save, ChevronRight, Clock,
  Activity, Layers, Star, BookOpen, UserPlus, RefreshCw,
  Upload, Database, TrendingUp, Heart, AlertCircle, Target, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_BASE_SKILLS, ROLE_BASE_LABELS, ALL_SKILLS, skillLabel } from '@/lib/agent-skills';
import SkillManager from './SkillManager';

const BLUE = '#3b82f6';
const CYAN = '#06b6d4';

type Tab = 'agents' | 'memory' | 'sessions' | 'creator';

interface Agent {
  id: string; name: string; role: string; tone: string | null;
  systemPrompt: string | null; provider: string; model: string;
  mode: string; isActive: boolean; capabilities: string[];
  createdAt: string; memoriesCount?: number; sessionsCount?: number;
}

interface Memory {
  id: string; agentId: string; type: string; key: string; value: string;
  importance: number; memoryLevel: string; emotion: string | null;
  tags: string | null; refCount: number; isArchived: boolean;
  sourceSessionId: string | null; sourceTitle: string | null;
  createdAt: string; updatedAt: string;
}

interface MemoryCounts { stm: number; mtm: number; ltm: number; total: number; }

interface Session {
  id: string; title: string; messageCount: number; updatedAt: string; preview: string;
}

interface SessionMessage {
  id: string; sessionId: string; role: string; content: string; createdAt: string;
}

interface AgentStats { memories: number; sessions: number; messages: number; }

const ROLE_META: Record<string, { icon: any; color: string; label: string }> = {
  psychologist: { icon: Brain, color: 'violet', label: 'Psychologue' },
  coach: { icon: Zap, color: 'emerald', label: 'Coach Sportif' },
  nutrition: { icon: Flame, color: 'amber', label: 'Nutrition' },
  oracle: { icon: Star, color: 'blue', label: 'Oracle' },
  organization: { icon: Calendar, color: 'rose', label: 'Organisation' },
  assistant: { icon: Bot, color: 'slate', label: 'Assistant' },
};

const AGENT_META: Record<string, { icon: any; color: string; label: string }> = {
  'Psyché': { icon: Brain, color: 'violet', label: 'Psychologue' },
  'Ami': { icon: Heart, color: 'pink', label: 'Confident' },
  'Stoïcien': { icon: Target, color: 'amber', label: 'Philosophe' },
};

function getAgentMeta(agent: { name: string; role: string }) {
  return AGENT_META[agent.name] || ROLE_META[agent.role] || { icon: Bot, color: 'slate', label: agent.role };
}

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'à l\'instant';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role];
  if (!meta) return null;
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-medium border uppercase tracking-wider", colorMap[meta.color] || '')}>
      {meta.label}
    </span>
  );
}

function AgentCard({ agent, onSelect, onEdit }: { agent: Agent; onSelect: (a: Agent) => void; onEdit: (a: Agent) => void }) {
  const img = AGENT_IMAGES[agent.name];
  const baseSkills = ROLE_BASE_SKILLS[agent.role] || [];
  const extraSkills = (agent.capabilities || []).filter(c => !baseSkills.includes(c));
  const displaySkills = extraSkills.length > 0 ? extraSkills.slice(0, 3) : [];
  const hasMore = extraSkills.length > 3;

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-white/[0.06] cursor-pointer transition-all duration-500"
      style={{
        background: 'rgba(18, 18, 23, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: `inset 0 1px 1px rgba(255,255,255,0.02), 0 0 40px ${BLUE}08`,
      }}
      onClick={() => onSelect(agent)}
    >
      {img && (
        <div className="absolute inset-0 z-0">
          <img src={img} alt={agent.name} className="w-full h-full object-cover opacity-[0.15] group-hover:opacity-[0.25] transition-opacity duration-700 scale-105 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent" />
        </div>
      )}

      <div className="relative z-10 p-5 flex flex-col h-full min-h-[260px]">
        <div className="flex items-start justify-between mb-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl overflow-hidden"
              style={{ boxShadow: `0 0 20px ${BLUE}22` }}>
              {img ? (
                <img src={img} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <Bot className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{agent.name}</h3>
              <RoleBadge role={agent.role} />
            </div>
          </div>
          <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1", agent.isActive ? 'bg-blue-400' : 'bg-slate-600')}
            style={agent.isActive ? { boxShadow: `0 0 10px ${BLUE}` } : undefined}
          />
        </div>

        <div className="mt-4 space-y-2">
          {baseSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {baseSkills.slice(0, 4).map((s, i) => (
                <span key={s}
                  className="px-2 py-0.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-[9px] text-blue-300/70 font-mono">
                  {ROLE_BASE_LABELS[agent.role]?.[i] || s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {displaySkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {displaySkills.map(s => (
                <span key={s}
                  className="px-2 py-0.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-[9px] text-cyan-300 font-mono">
                  +{ALL_SKILLS[s]?.label || s.replace(/_/g, ' ')}
                </span>
              ))}
              {hasMore && <span className="text-[9px] text-slate-600 font-mono self-center">+{extraSkills.length - 3}</span>}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onSelect(agent); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
              boxShadow: `0 0 16px ${BLUE}33`,
            }}>
            <Zap className="w-3 h-3" /> Compétences
          </button>
          <button onClick={e => { e.stopPropagation(); onEdit(agent); }}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AgentsDashboard() {
  const [tab, setTab] = useState<Tab>('agents');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, AgentStats>>({});
  const [globalStats, setGlobalStats] = useState({ agents: 0, memories: 0, sessions: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [newMemory, setNewMemory] = useState({ key: '', value: '', type: 'context', importance: 3, memoryLevel: 'mtm' });
  const [showNewMemory, setShowNewMemory] = useState(false);

  const [memoryLevel, setMemoryLevel] = useState<string>('all');
  const [memoryCounts, setMemoryCounts] = useState<MemoryCounts>({ stm: 0, mtm: 0, ltm: 0, total: 0 });
  const [importingMd, setImportingMd] = useState(false);
  const [consolidating, setConsolidating] = useState(false);
  const [showImportMd, setShowImportMd] = useState(false);
  const [mdImportText, setMdImportText] = useState('');
  const [mdImportTitle, setMdImportTitle] = useState('');

  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [showEditAgent, setShowEditAgent] = useState(false);

  const [skillAgent, setSkillAgent] = useState<Agent | null>(null);

  const [creatorForm, setCreatorForm] = useState({
    name: '', role: 'assistant', systemPrompt: '', tone: '', capabilities: '',
  });

  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const statsFetchedRef = useRef<Set<string>>(new Set());

  const showNotif = useCallback((type: 'success' | 'error', message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3000);
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agent-service?action=agents');
      const data = await res.json();
      if (data.success) {
        if (data.agents.length === 0) {
          await fetch('/api/agent-service?action=seed');
          const res2 = await fetch('/api/agent-service?action=agents');
          const data2 = await res2.json();
          if (data2.success) {
            setAgents(data2.agents);
            setGlobalStats(prev => ({ ...prev, agents: data2.agents.length }));
          }
        } else {
          setAgents(data.agents);
          setGlobalStats(prev => ({ ...prev, agents: data.agents.length }));
        }
      }
    } catch (e) { console.error('Failed to fetch agents'); }
  }, []);

  const fetchStats = useCallback(async (agentId: string) => {
    try {
      const res = await fetch(`/api/agent-service?action=stats&agentId=${agentId}`);
      const data = await res.json();
      if (data.success) setStats(prev => ({ ...prev, [agentId]: data.stats }));
    } catch {}
  }, []);

  const fetchMemories = useCallback(async (agentId: string, level?: string) => {
    try {
      const lvl = level || memoryLevel;
      const url = lvl && lvl !== 'all'
        ? `/api/agent-service?action=memories&agentId=${agentId}&level=${lvl}`
        : `/api/agent-service?action=memories&agentId=${agentId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setMemories(data.memories);
    } catch {}
  }, [memoryLevel]);

  const fetchMemoryCounts = useCallback(async (agentId: string) => {
    try {
      const res = await fetch(`/api/agent-service?action=memoriesCount&agentId=${agentId}`);
      const data = await res.json();
      if (data.success && data.total !== undefined) {
        setMemoryCounts({ stm: data.stm, mtm: data.mtm, ltm: data.ltm, total: data.total });
      }
    } catch {}
  }, []);

  const fetchSessions = useCallback(async (agentId: string) => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const res = await fetch(`/api/agent-service?action=sessions&agentId=${agentId}`);
      const data = await res.json();
      if (data.success) setSessions(data.sessions);
      else { setSessionsError(data.error || 'Erreur API'); }
    } catch (e) { setSessionsError('Erreur réseau'); }
    setSessionsLoading(false);
  }, []);

  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/agent-service?action=messages&sessionId=${sessionId}`);
      const data = await res.json();
      if (data.success) setSessionMessages(data.messages);
    } catch {}
  }, []);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    await fetchAgents();
    setLoading(false);
  };

  useEffect(() => {
    if (selectedAgent && !statsFetchedRef.current.has(selectedAgent.id)) {
      statsFetchedRef.current.add(selectedAgent.id);
      fetchStats(selectedAgent.id);
    }
  }, [selectedAgent, fetchStats]);

  useEffect(() => {
    if (selectedAgent) {
      const s = stats[selectedAgent.id];
      if (s) {
        setGlobalStats(prev => ({ ...prev, memories: s.memories, sessions: s.sessions, messages: s.messages }));
      }
    }
  }, [stats, selectedAgent]);

  useEffect(() => {
    if (selectedAgent && tab === 'memory') {
      fetchMemories(selectedAgent.id);
      fetchMemoryCounts(selectedAgent.id);
    }
  }, [selectedAgent, tab, fetchMemories, fetchMemoryCounts]);

  useEffect(() => {
    if (selectedAgent && tab === 'sessions') fetchSessions(selectedAgent.id);
  }, [selectedAgent, tab, fetchSessions]);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setExpandedSession(null);
    setSessionMessages([]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    statsFetchedRef.current = new Set();
    await loadAll();
    if (selectedAgent) {
      statsFetchedRef.current.delete(selectedAgent.id);
      await fetchStats(selectedAgent.id);
      if (tab === 'memory') await fetchMemories(selectedAgent.id);
      if (tab === 'sessions') await fetchSessions(selectedAgent.id);
    }
    setRefreshing(false);
    showNotif('success', 'Données actualisées');
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', agentId: agent.id, isActive: !agent.isActive }),
      });
      await fetchAgents();
      setSelectedAgent(prev => prev?.id === agent.id ? { ...prev, isActive: !prev.isActive } : prev);
      showNotif('success', `${agent.name} ${agent.isActive ? 'désactivé' : 'activé'}`);
    } catch { showNotif('error', 'Erreur'); }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (!confirm(`Supprimer définitivement ${agent.name} et toutes ses données ?`)) return;
    try {
      await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', agentId: agent.id }),
      });
      await fetchAgents();
      if (selectedAgent?.id === agent.id) setSelectedAgent(null);
      showNotif('success', `${agent.name} supprimé`);
    } catch { showNotif('error', 'Erreur'); }
  };

  const handleSaveEditAgent = async () => {
    if (!editAgent) return;
    try {
      await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update', agentId: editAgent.id,
          name: editAgent.name, role: editAgent.role,
          systemPrompt: editAgent.systemPrompt,
          tone: editAgent.tone, isActive: editAgent.isActive,
        }),
      });
      await fetchAgents();
      setSelectedAgent(editAgent);
      setShowEditAgent(false);
      showNotif('success', 'Agent mis à jour');
    } catch { showNotif('error', 'Erreur'); }
  };

  const handleCreateAgent = async () => {
    if (!creatorForm.name.trim()) { showNotif('error', 'Le nom est requis'); return; }
    try {
      const caps = creatorForm.capabilities.split(',').map(c => c.trim()).filter(Boolean);
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: creatorForm.name, role: creatorForm.role,
          systemPrompt: creatorForm.systemPrompt || undefined,
          tone: creatorForm.tone || undefined,
          capabilities: caps.length > 0 ? caps : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAgents();
        setCreatorForm({ name: '', role: 'assistant', systemPrompt: '', tone: '', capabilities: '' });
        showNotif('success', `${creatorForm.name} créé !`);
      } else { showNotif('error', data.error || 'Erreur'); }
    } catch { showNotif('error', 'Erreur réseau'); }
  };

  const handleAddMemory = async () => {
    if (!selectedAgent || !newMemory.key.trim()) return;
    try {
      await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'memory-create', agentId: selectedAgent.id,
          key: newMemory.key, value: newMemory.value,
          type: newMemory.type, importance: newMemory.importance,
          memoryLevel: newMemory.memoryLevel,
        }),
      });
      await fetchMemories(selectedAgent.id);
      await fetchMemoryCounts(selectedAgent.id);
      setNewMemory({ key: '', value: '', type: 'context', importance: 3, memoryLevel: 'mtm' });
      setShowNewMemory(false);
      showNotif('success', 'Souvenir ajouté');
    } catch { showNotif('error', 'Erreur'); }
  };

  const handleUpdateMemory = async () => {
    if (!editingMemory) return;
    try {
      await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'memory-update', agentId: selectedAgent?.id,
          memoryId: editingMemory.id,
          key: editingMemory.key, value: editingMemory.value,
          type: editingMemory.type, importance: editingMemory.importance,
        }),
      });
      await fetchMemories(selectedAgent!.id);
      setEditingMemory(null);
      showNotif('success', 'Souvenir mis à jour');
    } catch { showNotif('error', 'Erreur'); }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'memory-delete', memoryId, agentId: selectedAgent?.id }),
      });
      await fetchMemories(selectedAgent!.id);
      await fetchMemoryCounts(selectedAgent!.id);
      showNotif('success', 'Souvenir supprimé');
    } catch { showNotif('error', 'Erreur'); }
  };

  const handleImportMd = async () => {
    if (!selectedAgent || !mdImportText.trim()) return;
    setImportingMd(true);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'memory-import', agentId: selectedAgent.id,
          markdown: mdImportText, sourceTitle: mdImportTitle || 'Import .md',
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchMemories(selectedAgent.id);
        await fetchMemoryCounts(selectedAgent.id);
        showNotif('success', `${data.created} souvenirs importés`);
        setShowImportMd(false); setMdImportText(''); setMdImportTitle('');
      } else { showNotif('error', data.error || 'Erreur import'); }
    } catch { showNotif('error', 'Erreur réseau'); }
    setImportingMd(false);
  };

  const handleConsolidate = async () => {
    if (!selectedAgent) return;
    setConsolidating(true);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'memory-consolidate', agentId: selectedAgent.id }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchMemories(selectedAgent.id);
        await fetchMemoryCounts(selectedAgent.id);
        showNotif('success', `Consolidation : ${data.decayed} dégradés, ${data.archived} archivés, ${data.promoted} promus en LTM`);
      }
    } catch { showNotif('error', 'Erreur consolidation'); }
    setConsolidating(false);
  };

  const handleLevelChange = (level: string) => {
    setMemoryLevel(level);
    if (selectedAgent) fetchMemories(selectedAgent.id, level);
  };

  const handleToggleSession = (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null); setSessionMessages([]);
    } else {
      setExpandedSession(sessionId); fetchMessages(sessionId);
    }
  };

  const handleSaveSkills = async (agentId: string, capabilities: string[]) => {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', agentId, capabilities }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchAgents();
      showNotif('success', 'Compétences mises à jour');
    } else {
      showNotif('error', data.error || 'Erreur');
      throw new Error(data.error);
    }
  };

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {notif && (
        <div className={cn("fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-sm font-medium animate-slide-up",
          notif.type === 'success' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {notif.message}
        </div>
      )}

      <header className="flex items-start justify-between relative z-10">
        <div>
          <h1 className="font-serif text-5xl text-white mb-3 tracking-tight"
            style={{ textShadow: `0 0 40px ${BLUE}44` }}>Agents IA</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.08em] font-mono font-medium">Centre de commande de vos entités intelligentes</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="p-2 rounded-lg border border-white/10 hover:border-white/20 transition-all bg-white/[0.02] backdrop-blur-xl">
          <RefreshCw className={cn("w-4 h-4 text-slate-400", refreshing && "animate-spin")} />
        </button>
      </header>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Agents', value: globalStats.agents, icon: Bot, color: 'text-blue-400' },
          { label: 'Souvenirs', value: globalStats.memories, icon: BookOpen, color: 'text-emerald-400' },
          { label: 'Sessions', value: globalStats.sessions, icon: MessageSquare, color: 'text-violet-400' },
          { label: 'Messages', value: globalStats.messages, icon: Activity, color: 'text-amber-400' },
        ].map(stat => (
          <div key={stat.label}
            className="relative p-5 rounded-[20px] border border-white/[0.06] overflow-hidden group"
            style={{
              background: 'rgba(18, 18, 23, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02)',
            }}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)' }}
            />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <span className="text-[9px] text-slate-600 uppercase tracking-[0.08em] font-mono font-medium">{stat.label}</span>
            </div>
            <div className="relative z-10">
              <span className="text-2xl font-mono text-white font-medium">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {([
          { key: 'agents', Icon: Brain, label: 'Agents' },
          { key: 'memory', Icon: Database, label: 'Mémoire' },
          { key: 'sessions', Icon: MessageSquare, label: 'Sessions' },
          { key: 'creator', Icon: UserPlus, label: 'Créateur' },
        ] as const).map(({ key, Icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              tab === key ? "bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ===== AGENTS TAB - Full-bleed cards grid ===== */}
      {tab === 'agents' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un agent..." style={{ borderRadius: '16px' }}
              className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/30 transition-all"
            />
          </div>

          {loading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-slate-600 mx-auto mb-3 animate-spin" />
              <p className="text-slate-500 text-sm">Chargement des agents...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-16">
              <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">{searchQuery ? 'Aucun agent trouvé' : 'Aucun agent. Créez-en un !'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {filteredAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent}
                  onSelect={a => { setSelectedAgent(a); setSkillAgent(a); }}
                  onEdit={a => { setEditAgent({ ...a }); setShowEditAgent(true); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== MEMORY TAB ===== */}
      {tab === 'memory' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-1">
            <div className="p-4 rounded-[20px] border border-white/[0.06]"
              style={{ background: 'rgba(18,18,23,0.6)', backdropFilter: 'blur(20px)' }}>
              <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-3">Agent</h4>
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="text-center py-6 text-slate-500 text-xs">Chargement...</div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">Aucun agent</div>
                ) : agents.map(agent => {
                  const { icon: Icon, color } = getAgentMeta(agent);
                  return (
                    <button key={agent.id} onClick={() => handleSelectAgent(agent)}
                      className={cn(
                        "w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 group",
                        selectedAgent?.id === agent.id ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        color === 'violet' ? 'bg-violet-500/20 text-violet-400' :
                        color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                        color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                        color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        color === 'rose' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-slate-500/20 text-slate-400'
                      )}><Icon className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-200 truncate">{agent.name}</div>
                        <div className="text-[10px] text-slate-500">{getAgentMeta(agent).label}</div>
                      </div>
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", agent.isActive ? "bg-emerald-500" : "bg-slate-600")} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="xl:col-span-2">
            {selectedAgent ? (
              <div className="p-4 rounded-[20px] border border-white/[0.06]"
                style={{ background: 'rgba(18,18,23,0.6)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Souvenirs de {selectedAgent.name}
                    <span className="ml-2 text-slate-500">({memoryCounts.total || memories.length})</span>
                  </h4>
                  <div className="flex gap-1.5">
                    <button onClick={() => setShowImportMd(!showImportMd)}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 text-[10px] font-medium hover:bg-violet-500/20 transition-all">
                      <Upload className="w-3 h-3" /> .md
                    </button>
                    <button onClick={handleConsolidate} disabled={consolidating}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-medium hover:bg-blue-500/20 transition-all disabled:opacity-50">
                      <Database className={cn("w-3 h-3", consolidating && "animate-spin")} /> Consolider
                    </button>
                    <button onClick={() => setShowNewMemory(!showNewMemory)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all">
                      <Plus className="w-3 h-3" /> Ajouter
                    </button>
                  </div>
                </div>

                {showImportMd && (
                  <div className="mb-4 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Upload className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-[10px] text-violet-300 font-medium uppercase tracking-wider">Importer un fichier .md</span>
                    </div>
                    <input value={mdImportTitle} onChange={e => setMdImportTitle(e.target.value)}
                      placeholder="Titre de la source (optionnel)"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/30" />
                    <textarea value={mdImportText} onChange={e => setMdImportText(e.target.value)}
                      placeholder="Colle le contenu markdown ici..."
                      rows={6} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/30 resize-none font-mono" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setShowImportMd(false); setMdImportText(''); setMdImportTitle(''); }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-all">Annuler</button>
                      <button onClick={handleImportMd} disabled={importingMd || !mdImportText.trim()}
                        className="px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-medium hover:bg-violet-500/30 transition-all disabled:opacity-50">
                        {importingMd ? 'Analyse...' : 'Importer'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-1 mb-3">
                  {[
                    { id: 'all', label: 'Tous', count: memoryCounts.total },
                    { id: 'ltm', label: 'LTM', count: memoryCounts.ltm },
                    { id: 'mtm', label: 'MTM', count: memoryCounts.mtm },
                    { id: 'stm', label: 'STM', count: memoryCounts.stm },
                  ].map(lvl => (
                    <button key={lvl.id} onClick={() => handleLevelChange(lvl.id)}
                      className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border",
                        memoryLevel === lvl.id
                          ? lvl.id === 'ltm' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : lvl.id === 'mtm' ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                            : lvl.id === 'stm' ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                            : 'bg-slate-500/15 border-slate-500/30 text-slate-300'
                          : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                      )}
                    >
                      <span className={
                        lvl.id === 'ltm' ? 'text-emerald-400' : lvl.id === 'mtm' ? 'text-amber-400' : lvl.id === 'stm' ? 'text-blue-400' : ''
                      }>{lvl.id === 'ltm' ? '🧠 ' : lvl.id === 'mtm' ? '💭 ' : lvl.id === 'stm' ? '⚡ ' : ''}{lvl.label}</span>
                      <span className="text-slate-500">({lvl.count})</span>
                    </button>
                  ))}
                </div>

                {showNewMemory && (
                  <div className="mb-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input value={newMemory.key} onChange={e => setNewMemory(p => ({ ...p, key: e.target.value }))}
                        placeholder="Clé (ex: age_user)" className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/30" />
                      <select value={newMemory.type} onChange={e => setNewMemory(p => ({ ...p, type: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none">
                        <option value="context">Contexte</option>
                        <option value="preference">Préférence</option>
                        <option value="learning">Apprentissage</option>
                        <option value="style">Style</option>
                      </select>
                    </div>
                    <textarea value={newMemory.value} onChange={e => setNewMemory(p => ({ ...p, value: e.target.value }))}
                      placeholder="Valeur du souvenir..."
                      rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/30 resize-none" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">Niveau:</span>
                        <select value={newMemory.memoryLevel} onChange={e => setNewMemory(p => ({ ...p, memoryLevel: e.target.value }))}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-200">
                          <option value="stm">STM (court terme)</option>
                          <option value="mtm">MTM (moyen terme)</option>
                          <option value="ltm">LTM (long terme)</option>
                        </select>
                        <span className="text-[10px] text-slate-500 ml-2">Importance:</span>
                        {[1,2,3,4,5].map(n => (
                          <button key={n} onClick={() => setNewMemory(p => ({ ...p, importance: n }))}
                            className={cn("w-5 h-5 rounded text-[10px] font-bold transition-all",
                              newMemory.importance >= n ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-slate-600"
                            )}>{n}</button>
                        ))}
                      </div>
                      <button onClick={handleAddMemory}
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-all">
                        <Save className="w-3 h-3 inline mr-1" /> Sauvegarder
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {memories.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs">Aucun souvenir pour ce niveau</p>
                    </div>
                  ) : memories.map(mem => (
                    <div key={mem.id} className="p-3 rounded-xl bg-white/5 border border-white/10 group">
                      {editingMemory?.id === mem.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <input value={editingMemory.key} onChange={e => setEditingMemory(p => p ? { ...p, key: e.target.value } : null)}
                               className="col-span-2 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/30" />
                            <select value={editingMemory.type} onChange={e => setEditingMemory(p => p ? { ...p, type: e.target.value } : null)}
                               className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200">
                              <option value="context">Contexte</option>
                              <option value="preference">Préférence</option>
                              <option value="learning">Apprentissage</option>
                              <option value="style">Style</option>
                              <option value="mtm_emotion">MTM Émotion</option>
                              <option value="mtm_pattern">MTM Pattern</option>
                              <option value="mtm_reflection">MTM Réflexion</option>
                              <option value="ltm_identity">LTM Identité</option>
                              <option value="ltm_milestone">LTM Étape</option>
                              <option value="ltm_value">LTM Valeur</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input value={editingMemory.memoryLevel} onChange={e => setEditingMemory(p => p ? { ...p, memoryLevel: e.target.value } : null)}
                               placeholder="Niveau (stm/mtm/ltm)" className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200" />
                            <input value={editingMemory.emotion || ''} onChange={e => setEditingMemory(p => p ? { ...p, emotion: e.target.value || null } : null)}
                               placeholder="Émotion" className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200" />
                          </div>
                            <textarea value={editingMemory.value} onChange={e => setEditingMemory(p => p ? { ...p, value: e.target.value } : null)}
                              rows={2} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none resize-none" />
                          <div className="flex justify-between">
                            <div className="flex gap-1">
                              {[1,2,3,4,5].map(n => (
                                <button key={n} onClick={() => setEditingMemory(p => p ? { ...p, importance: n } : p)}
                                  className={cn("w-5 h-5 rounded text-[10px] font-bold",
                                    editingMemory.importance >= n ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-slate-600"
                                  )}>{n}</button>
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <button onClick={handleUpdateMemory} className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">Sauver</button>
                              <button onClick={() => setEditingMemory(null)} className="px-2 py-1 rounded bg-white/5 text-slate-400 text-[10px]">Annuler</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                mem.memoryLevel === 'ltm' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                mem.memoryLevel === 'mtm' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              )}>
                                {mem.memoryLevel === 'ltm' ? '🧠 LTM' : mem.memoryLevel === 'mtm' ? '💭 MTM' : '⚡ STM'}
                              </span>
                              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded",
                                mem.type === 'context' ? 'bg-blue-500/10 text-blue-400' :
                                mem.type === 'preference' ? 'bg-amber-500/10 text-amber-400' :
                                mem.type === 'learning' ? 'bg-emerald-500/10 text-emerald-400' :
                                mem.type === 'style' ? 'bg-violet-500/10 text-violet-400' :
                                mem.type.startsWith('mtm_') ? 'bg-amber-500/10 text-amber-400' :
                                mem.type.startsWith('ltm_') ? 'bg-emerald-500/10 text-emerald-400' :
                                'bg-slate-500/10 text-slate-400'
                              )}>{mem.type}</span>
                              {mem.emotion && (
                                <span className="flex items-center gap-0.5 text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                                  <Heart className="w-2.5 h-2.5" /> {mem.emotion}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-600">● {mem.importance}/5</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingMemory({ ...mem })} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-blue-400">
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDeleteMemory(mem.id)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{mem.value}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[9px] text-slate-600">{formatDate(mem.createdAt)}</span>
                            {mem.refCount > 0 && <span className="text-[9px] text-slate-600 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" /> référé {mem.refCount}x</span>}
                            {mem.sourceTitle && <span className="text-[9px] text-slate-600 flex items-center gap-0.5"><BookOpen className="w-2.5 h-2.5" /> {mem.sourceTitle}</span>}
                            {mem.memoryLevel === 'mtm' && mem.importance <= 2 && (
                              <span className="text-[9px] text-amber-500/70 flex items-center gap-0.5"><AlertCircle className="w-2.5 h-2.5" /> En dégradation</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-10 text-center rounded-[20px] border border-white/[0.06]"
                style={{ background: 'rgba(18,18,23,0.6)' }}>
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Sélectionne un agent pour voir sa mémoire</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== SESSIONS TAB ===== */}
      {tab === 'sessions' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-1">
            <div className="p-4 rounded-[20px] border border-white/[0.06]"
              style={{ background: 'rgba(18,18,23,0.6)', backdropFilter: 'blur(20px)' }}>
              <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-3">Agent</h4>
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto custom-scrollbar">
                {agents.map(agent => {
                  const { icon: Icon, color } = getAgentMeta(agent);
                  return (
                    <button key={agent.id} onClick={() => handleSelectAgent(agent)}
                      className={cn("w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 group",
                        selectedAgent?.id === agent.id ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        color === 'violet' ? 'bg-violet-500/20 text-violet-400' :
                        color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                        color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                        color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        color === 'rose' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-slate-500/20 text-slate-400'
                      )}><Icon className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-200 truncate">{agent.name}</div>
                        <div className="text-[10px] text-slate-500">{getAgentMeta(agent).label}</div>
                      </div>
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", agent.isActive ? "bg-emerald-500" : "bg-slate-600")} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="xl:col-span-2">
            {selectedAgent ? (
              <div className="p-4 rounded-[20px] border border-white/[0.06]"
                style={{ background: 'rgba(18,18,23,0.6)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Sessions avec {selectedAgent.name}
                    {!sessionsLoading && <span className="ml-2 text-slate-500">({sessions.length})</span>}
                  </h4>
                  <button onClick={() => fetchSessions(selectedAgent.id)}
                    className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                      sessionsLoading ? "bg-white/5 text-slate-500" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20")}>
                    <RefreshCw className={cn("w-3 h-3", sessionsLoading && "animate-spin")} /> Actualiser
                  </button>
                </div>

                {sessionsError && (
                  <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400">
                    Erreur : {sessionsError}
                  </div>
                )}

                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {sessionsLoading ? (
                    <div className="text-center py-8"><RefreshCw className="w-6 h-6 text-slate-600 mx-auto mb-2 animate-spin" /><p className="text-slate-500 text-xs">Chargement...</p></div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8"><MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" /><p className="text-slate-500 text-xs">Aucune session</p></div>
                  ) : sessions.map(session => (
                    <div key={session.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                      <button onClick={() => handleToggleSession(session.id)}
                        className="w-full p-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-200 truncate">{session.title}</span>
                            <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-white/5 shrink-0">{session.messageCount} msg</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500">{formatDate(session.updatedAt)}</span>
                            <span className="text-[10px] text-slate-600">· {timeAgo(session.updatedAt)}</span>
                          </div>
                        </div>
                        <ChevronRight className={cn("w-4 h-4 text-slate-500 transition-transform", expandedSession === session.id && "rotate-90")} />
                      </button>

                      {expandedSession === session.id && (
                        <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
                          {sessionMessages.length === 0 ? (
                            <div className="text-center py-3"><RefreshCw className="w-4 h-4 text-slate-600 mx-auto mb-1 animate-spin" /><p className="text-slate-600 text-[10px]">Chargement...</p></div>
                          ) : (
                            sessionMessages.map(msg => (
                              <div key={msg.id} className={cn("p-2.5 rounded-lg text-xs leading-relaxed",
                                msg.role === 'user' ? "bg-blue-500/5 border border-blue-500/10 ml-6" : "bg-emerald-500/5 border border-emerald-500/10 mr-6")}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={cn("text-[10px] font-medium uppercase tracking-wider", msg.role === 'user' ? "text-blue-400" : "text-emerald-400")}>
                                    {msg.role === 'user' ? 'Vous' : selectedAgent.name}
                                  </span>
                                  <span className="text-[9px] text-slate-600">{formatDate(msg.createdAt)}</span>
                                </div>
                                <p className="text-slate-200">{msg.content}</p>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-10 text-center rounded-[20px] border border-white/[0.06]"
                style={{ background: 'rgba(18,18,23,0.6)' }}>
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Sélectionne un agent pour voir ses sessions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== CREATOR TAB ===== */}
      {tab === 'creator' && (
        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-[24px] border border-white/[0.06]"
            style={{
              background: 'rgba(18,18,23,0.6)', backdropFilter: 'blur(20px)',
              boxShadow: `inset 0 1px 1px rgba(255,255,255,0.02), 0 0 40px ${BLUE}11`,
            }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20"
                style={{ boxShadow: `0 0 20px ${BLUE}22` }}>
                <UserPlus className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Nouvel Agent</h3>
                <p className="text-[10px] text-slate-500">Crée une nouvelle entité IA</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Nom *</label>
                  <input value={creatorForm.name} onChange={e => setCreatorForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="ex: Hermès"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/30" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Rôle</label>
                  <select value={creatorForm.role} onChange={e => setCreatorForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none">
                    <option value="assistant">Assistant</option>
                    <option value="psychologist">Psychologue</option>
                    <option value="coach">Coach Sportif</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="oracle">Oracle</option>
                    <option value="organization">Organisation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">System Prompt</label>
                <textarea value={creatorForm.systemPrompt} onChange={e => setCreatorForm(p => ({ ...p, systemPrompt: e.target.value }))}
                  placeholder="Décris la personnalité..."
                  rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/30 resize-none" />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Ton</label>
                <input value={creatorForm.tone} onChange={e => setCreatorForm(p => ({ ...p, tone: e.target.value }))}
                  placeholder="ex: Chaleureux, direct..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/30" />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Capacités (séparées par des virgules)</label>
                <input value={creatorForm.capabilities} onChange={e => setCreatorForm(p => ({ ...p, capabilities: e.target.value }))}
                  placeholder="ex: web_search, data_access, writing"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/30" />
              </div>

              <button onClick={handleCreateAgent}
                className="w-full py-3 rounded-xl text-xs font-bold text-white transition-all"
                style={{
                  background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
                  boxShadow: `0 0 24px ${BLUE}33`,
                }}>
                <Plus className="w-3.5 h-3.5 inline mr-1.5" /> Créer l'Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT AGENT MODAL ===== */}
      {showEditAgent && editAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-modal-backdrop-in">
          <div className="w-full max-w-lg mx-4 p-6 animate-modal-content-in rounded-[24px]"
            style={{
              background: 'rgba(11,13,20,0.95)', backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: `0 0 60px rgba(59,130,246,0.08)`,
            }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Modifier {editAgent.name}</h3>
              <button onClick={() => setShowEditAgent(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-1">Nom</label>
                  <input value={editAgent.name} onChange={e => setEditAgent(p => ({ ...p, name: e.target.value } as Agent))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-1">Rôle</label>
                  <select value={editAgent.role} onChange={e => setEditAgent(p => ({ ...p, role: e.target.value } as Agent))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none">
                    {Object.entries(ROLE_META).map(([key, meta]) => (
                      <option key={key} value={key}>{meta.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">System Prompt</label>
                <textarea value={editAgent.systemPrompt || ''} onChange={e => setEditAgent(p => ({ ...p, systemPrompt: e.target.value } as Agent))}
                  rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">Ton</label>
                <input value={editAgent.tone || ''} onChange={e => setEditAgent(p => ({ ...p, tone: e.target.value } as Agent))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowEditAgent(false)} className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-slate-200">Annuler</button>
              <button onClick={handleSaveEditAgent} className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`, boxShadow: `0 0 16px ${BLUE}33` }}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SKILL MANAGER MODAL ===== */}
      {skillAgent && (
        <SkillManager
          agent={skillAgent}
          onClose={() => setSkillAgent(null)}
          onSave={handleSaveSkills}
        />
      )}
    </div>
  );
}

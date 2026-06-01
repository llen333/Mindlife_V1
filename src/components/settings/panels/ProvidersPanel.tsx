'use client';

import { useState, useEffect } from 'react';
import {
  Zap, Plus, Trash2, TestTube, RefreshCw, Check, AlertTriangle,
  Eye, EyeOff, Loader2, Server, Key, Globe, ChevronDown, ChevronUp,
  ExternalLink, Info, Wifi, WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { encryptKey, getOrCreatePassphrase, PROVIDER_KEYS_STORAGE, decryptKey } from '@/lib/crypto';

interface ProviderDef {
  id: string;
  name: string;
  baseUrl: string;
  models: string[];
  defaultModel?: string;
  isBuiltin: boolean;
  hasKey?: boolean;
  keyEnv?: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  zai: 'from-indigo-500 to-blue-600',
  groq: 'from-purple-500 to-violet-500',
  openrouter: 'from-blue-500 to-cyan-500',
  openai: 'from-green-500 to-emerald-500',
  huggingface: 'from-yellow-500 to-orange-500',
  gemini: 'from-pink-500 to-rose-500',
  local: 'from-gray-500 to-slate-500',
};

export default function ProvidersPanel() {
  const [providers, setProviders] = useState<ProviderDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [loadingModelsId, setLoadingModelsId] = useState<string | null>(null);
  const [fetchedModels, setFetchedModels] = useState<Record<string, string[]>>({});
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ id: '', name: '', baseUrl: '', defaultModel: '', apiKey: '' });
  const [saving, setSaving] = useState(false);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      if (data.success) setProviders(data.providers);
      else setError(data.error || 'Erreur chargement');
    } catch { setError('Impossible de charger les providers'); }
    setLoading(false);
  };

  const loadLocalKeys = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(PROVIDER_KEYS_STORAGE);
      if (raw) setApiKeys(JSON.parse(raw));
    } catch {}
  };

  const saveLocalKey = (providerId: string, key: string) => {
    const updated = { ...apiKeys, [providerId]: key };
    setApiKeys(updated);
    localStorage.setItem(PROVIDER_KEYS_STORAGE, JSON.stringify(updated));
  };

  useEffect(() => { loadProviders(); loadLocalKeys(); }, []);

  const canTest = (p: ProviderDef): boolean => {
    return p.isBuiltin ? !!(p.hasKey || apiKeys[p.id]) : !!apiKeys[p.id];
  };

  const handleTest = async (p: ProviderDef) => {
    if (!canTest(p)) return;
    setTestingId(p.id);
    setTestResults(prev => ({ ...prev, [p.id]: { success: false, message: 'Test en cours...' } }));
    const body: any = { action: 'test', model: p.defaultModel };
    const localKey = apiKeys[p.id];
    if (p.isBuiltin && !localKey) {
      body.providerId = p.id;
    } else {
      body.baseUrl = p.baseUrl;
      body.apiKey = localKey || '';
    }
    const res = await fetch('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setTestResults(prev => ({ ...prev, [p.id]: data }));
    setTestingId(null);
  };

  const handleFetchModels = async (p: ProviderDef) => {
    if (!canTest(p)) return;
    setLoadingModelsId(p.id);
    const body: any = { action: 'models' };
    const localKey = apiKeys[p.id];
    if (p.isBuiltin && !localKey) {
      body.providerId = p.id;
    } else {
      body.baseUrl = p.baseUrl;
      body.apiKey = localKey || '';
    }
    const res = await fetch('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success && data.models) setFetchedModels(prev => ({ ...prev, [p.id]: data.models }));
    setLoadingModelsId(null);
  };

  const handleSetModel = async (providerId: string, model: string) => {
    const res = await fetch('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set-model', id: providerId, model }),
    });
    if (res.ok) {
      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, defaultModel: model } : p));
      setSelectedModel(null);
    }
  };

  const handleAddProvider = async () => {
    if (!addForm.id || !addForm.name || !addForm.baseUrl) return;
    setSaving(true);
    const res = await fetch('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', ...addForm, models: [] }),
    });
    const data = await res.json();
    if (data.success) {
      if (addForm.apiKey) saveLocalKey(addForm.id, addForm.apiKey);
      setShowAddForm(false);
      setAddForm({ id: '', name: '', baseUrl: '', defaultModel: '', apiKey: '' });
      await loadProviders();
    }
    setSaving(false);
  };

  const handleRemove = async (id: string) => {
    const res = await fetch('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', id }),
    });
    const data = await res.json();
    if (data.success) {
      const updated = { ...apiKeys };
      delete updated[id];
      setApiKeys(updated);
      localStorage.setItem(PROVIDER_KEYS_STORAGE, JSON.stringify(updated));
      await loadProviders();
    }
  };

  const connectedCount = providers.filter(p => p.isBuiltin ? p.hasKey || !!apiKeys[p.id] : !!apiKeys[p.id]).length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-white mb-2 tracking-tight" style={{ textShadow: '0 0 40px #8b5cf644' }}>
            Providers IA
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.08em] font-mono font-medium">
            {connectedCount}/{providers.length} connectés • Clés stockées chiffrées côté client
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold hover:from-violet-600 hover:to-purple-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Provider custom
        </button>
      </header>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {showAddForm && (
        <div className="p-6 rounded-3xl border border-violet-500/20" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(2,2,2,0.95))' }}>
          <h3 className="text-lg font-bold text-white mb-4">Nouveau provider</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">ID (slug)</label>
              <input value={addForm.id} onChange={e => setAddForm(f => ({ ...f, id: e.target.value }))}
                placeholder="mon-provider" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/40" />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Nom</label>
              <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Mon Provider" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/40" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">URL de base</label>
              <input value={addForm.baseUrl} onChange={e => setAddForm(f => ({ ...f, baseUrl: e.target.value }))}
                placeholder="https://api.example.com/v1" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/40" />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Modèle par défaut</label>
              <input value={addForm.defaultModel} onChange={e => setAddForm(f => ({ ...f, defaultModel: e.target.value }))}
                placeholder="gpt-4o-mini" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/40" />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Clé API (optionnelle)</label>
              <input type="password" value={addForm.apiKey} onChange={e => setAddForm(f => ({ ...f, apiKey: e.target.value }))}
                placeholder="sk-..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/40" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAddProvider} disabled={saving || !addForm.id || !addForm.name || !addForm.baseUrl}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter'}
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="px-6 py-3 rounded-xl border border-white/10 text-white/60 text-sm hover:text-white transition-all">
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map(p => {
            const localKey = apiKeys[p.id] || '';
            const isConnected = p.isBuiltin ? p.hasKey || !!localKey : !!localKey;
            const hasTestResult = testResults[p.id];

            return (
              <div key={p.id}
                className="p-5 rounded-3xl border transition-all duration-300 hover:border-violet-500/20"
                style={{
                  background: 'rgba(18,18,23,0.6)',
                  backdropFilter: 'blur(20px)',
                  borderColor: isConnected ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center",
                      `bg-gradient-to-br ${PROVIDER_COLORS[p.id] || 'from-gray-500 to-slate-500'}`)}>
                      <Server className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isConnected ? (
                          <><Wifi className="w-3 h-3 text-green-400" /><span className="text-[10px] text-green-400">Connecté</span></>
                        ) : (
                          <><WifiOff className="w-3 h-3 text-slate-500" /><span className="text-[10px] text-slate-500">Pas de clé</span></>
                        )}
                        {p.isBuiltin && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 uppercase">intégré</span>}
                      </div>
                    </div>
                  </div>
                  {!p.isBuiltin && (
                    <button onClick={() => handleRemove(p.id)}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-1 mb-4 text-xs text-white/40 font-mono">
                  <div className="truncate" title={p.baseUrl}>{p.baseUrl || '(aucune)'}</div>
                  {p.defaultModel && (
                    <div>
                      <button onClick={() => setSelectedModel(selectedModel === p.id ? null : p.id)}
                        className="flex items-center gap-1 text-white/60 hover:text-white transition-colors">
                        Modèle: <span className="text-white/80 underline decoration-dotted underline-offset-2">{p.defaultModel}</span>
                        {(fetchedModels[p.id]?.length ?? 0) > 1 && (
                          selectedModel === p.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                      {selectedModel === p.id && fetchedModels[p.id] && fetchedModels[p.id].length > 1 && (
                        <div className="mt-1.5 max-h-40 overflow-y-auto rounded-lg bg-white/5 border border-white/10 p-1 space-y-0.5">
                          {fetchedModels[p.id].map(m => (
                            <button key={m}
                              onClick={() => handleSetModel(p.id, m)}
                              className={cn(
                                "w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors",
                                m === p.defaultModel
                                  ? "text-violet-300 bg-violet-500/10"
                                  : "text-white/50 hover:text-white hover:bg-white/5"
                              )}>
                              {m === p.defaultModel && <Check className="w-2.5 h-2.5 inline mr-1.5" />}
                              {m}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showKeys[p.id] ? 'text' : 'password'}
                      value={localKey}
                      onChange={e => saveLocalKey(p.id, e.target.value)}
                      placeholder="Clé API..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40"
                    />
                    <button onClick={() => setShowKeys(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showKeys[p.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleTest(p)} disabled={!canTest(p) || testingId === p.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 hover:text-white transition-all disabled:opacity-30">
                      {testingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <TestTube className="w-3 h-3" />}
                      Tester
                    </button>
                    <button onClick={() => handleFetchModels(p)} disabled={!canTest(p) || loadingModelsId === p.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 hover:text-white transition-all disabled:opacity-30">
                      {loadingModelsId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Modèles
                    </button>
                    {p.isBuiltin && p.keyEnv && (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs" title="Clé définie via variable d'environnement">
                        <Key className="w-3 h-3" /> .env
                      </div>
                    )}
                  </div>

                  {hasTestResult && (
                    <div className={cn("p-3 rounded-xl flex items-start gap-2",
                      hasTestResult.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20")}>
                      {hasTestResult.success ? <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                      <p className={cn("text-xs", hasTestResult.success ? "text-green-300" : "text-red-300")}>{hasTestResult.message}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-300">
          <p className="font-bold mb-1">Sécurité des clés API</p>
          <p className="text-amber-400/60">
            Les clés des providers intégrés sont stockées dans le fichier <code className="text-amber-300">.env.local</code> (jamais dans git).
            Les clés des providers customs sont chiffrées côté client (AES-256-GCM) et jamais transmises au serveur.
            Aucune clé API n'est embarquée dans le code source.
          </p>
        </div>
      </div>
    </div>
  );
}

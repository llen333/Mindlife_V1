'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Sparkles,
  Key,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AIProvider,
  AIFunction,
  getAIConfig,
  saveAIConfig,
  setApiKey,
  setFunctionProvider,
  PROVIDERS,
  hasValidApiKey,
} from '@/lib/ai-config';
import { testProviderConnection } from '@/lib/ai-provider';

interface AIConfigPanelProps {
  expanded?: boolean;
  onToggle?: () => void;
}

const FUNCTION_CONFIG: { id: AIFunction; name: string; icon: string; description: string }[] = [
  { id: 'spirit', name: 'Page Spirit', icon: '🧘', description: 'Psychologue, Ami, Stoïcien' },
  { id: 'meals', name: 'Génération repas', icon: '🍽️', description: 'Suggestions nutritionnelles' },
  { id: 'sport', name: 'Programmes sport', icon: '🏋️', description: 'Entraînements personnalisés' },
  { id: 'chat', name: 'Chat principal', icon: '💬', description: 'Assistant conversationnel' },
  { id: 'assistant', name: 'Assistant', icon: '🤖', description: 'Aide générale' },
  { id: 'calendar', name: 'Calendrier', icon: '📅', description: 'Planification' },
  { id: 'goals', name: 'Objectifs', icon: '🎯', description: 'Conseils de développement' },
  { id: 'tasks', name: 'Tâches', icon: '📋', description: 'Gestion et suggestions' },
];

export default function AIConfigPanel({ expanded = true, onToggle }: AIConfigPanelProps) {
  const [config, setConfig] = useState(() => getAIConfig());
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('groq');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userMemoryInput, setUserMemoryInput] = useState(config.userMemory || '');
  const [memorySaveSuccess, setMemorySaveSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  }, []);

  useEffect(() => {
    setUserMemoryInput(config.userMemory || '');
  }, [config.userMemory]);

  useEffect(() => {
    if (arrowRef.current) {
      gsap.to(arrowRef.current, { rotation: expanded ? 180 : 0, duration: 0.3, ease: 'power2.inOut' });
    }
  }, [expanded]);

  useEffect(() => {
    if (!contentRef.current) return;
    if (expanded) {
      gsap.fromTo(contentRef.current, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' });
    } else {
      gsap.to(contentRef.current, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });
    }
  }, [expanded]);

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) return;
    setIsSaving(true);
    setApiKey(selectedProvider, apiKeyInput.trim());
    setConfig(getAIConfig());
    setApiKeyInput('');
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveMemory = () => {
    const updated = { ...config, userMemory: userMemoryInput };
    saveAIConfig(updated);
    setConfig(getAIConfig());
    setMemorySaveSuccess(true);
    setTimeout(() => setMemorySaveSuccess(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim() && !config.apiKeys[selectedProvider]) return;
    setIsTesting(true);
    setTestResult(null);
    const keyToTest = apiKeyInput.trim() || config.apiKeys[selectedProvider];
    const result = await testProviderConnection(selectedProvider, keyToTest);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleFunctionProviderChange = (func: AIFunction, provider: AIProvider) => {
    setFunctionProvider(func, provider);
    setConfig(getAIConfig());
  };

  const getProviderColor = (provider: AIProvider) => {
    switch (provider) {
      case 'groq': return 'from-purple-500 to-violet-500';
      case 'openrouter': return 'from-blue-500 to-cyan-500';
      case 'openai': return 'from-green-500 to-emerald-500';
      case 'huggingface': return 'from-yellow-500 to-orange-500';
      case 'gemini': return 'from-pink-500 to-rose-500';
      case 'zai': return 'from-indigo-500 to-blue-600';
      case 'local': return 'from-gray-500 to-slate-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div
      ref={containerRef}
      className="rounded-3xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(2, 2, 2, 0.95) 50%, rgba(139, 92, 246, 0.04) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.15)',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", "bg-gradient-to-br from-purple-500 to-violet-500 shadow-lg")}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black uppercase tracking-tight text-white">IA & API</h2>
            <p className="text-sm text-white/40">Configuration des providers IA</p>
          </div>
        </div>
        <div ref={arrowRef}>
          <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div ref={contentRef} className="overflow-hidden">
          <div className="px-6 pb-8 space-y-8">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-sm text-purple-300">
                <p className="font-bold mb-1">Configuration des providers IA</p>
                <p className="text-white/60">Connectez des APIs gratuites comme Groq pour des réponses IA intelligentes. Sans clé API, le mode local (fallback) sera utilisé automatiquement.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Provider</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {(['zai', 'groq', 'openrouter', 'openai', 'huggingface', 'gemini', 'local'] as AIProvider[]).map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setSelectedProvider(provider)}
                    className={cn(
                      "relative p-4 rounded-2xl border transition-all",
                      selectedProvider === provider ? "border-purple-500/50 bg-purple-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    )}
                  >
                    {config.apiKeys[provider] && provider !== 'local' && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400" />
                    )}
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", `bg-gradient-to-br ${getProviderColor(provider)}`)}>
                      <Key className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-bold text-white truncate">{PROVIDERS[provider].name}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedProvider !== 'local' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Clé API {PROVIDERS[selectedProvider].name}</h3>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder={config.apiKeys[selectedProvider] ? '••••••••••••••••' : 'Entrez votre clé API'}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:border-purple-500/40 focus:bg-purple-500/5 transition-all text-white placeholder:text-white/20"
                    />
                    <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors">
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={handleSaveApiKey}
                    disabled={!apiKeyInput.trim() || isSaving}
                    className={cn(
                      "px-6 py-4 rounded-2xl font-bold text-sm transition-all",
                      saveSuccess ? "bg-green-500 text-white" : "bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600",
                      (!apiKeyInput.trim() || isSaving) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isSaving ? 'Sauvegarde...' : saveSuccess ? <Check className="w-5 h-5" /> : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting || (!apiKeyInput.trim() && !config.apiKeys[selectedProvider])}
                    className="px-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Test'}
                  </button>
                </div>
                {testResult && (
                  <div className={cn("p-4 rounded-xl flex items-center gap-3", testResult.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20")}>
                    {testResult.success ? <Check className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
                    <p className={cn("text-sm", testResult.success ? "text-green-300" : "text-red-300")}>{testResult.message}</p>
                  </div>
                )}
                <div className="text-sm text-white/40">
                  Pas de clé ?{' '}
                  <a
                    href={selectedProvider === 'groq' ? 'https://console.groq.com/keys' : selectedProvider === 'openrouter' ? 'https://openrouter.ai/keys' : selectedProvider === 'openai' ? 'https://platform.openai.com/api-keys' : selectedProvider === 'huggingface' ? 'https://huggingface.co/settings/tokens' : selectedProvider === 'zai' ? 'https://z.ai' : 'https://aistudio.google.com/app/apikey'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Obtenir une clé {PROVIDERS[selectedProvider].name}
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Configuration par fonction</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FUNCTION_CONFIG.map((func) => {
                  const currentProvider = config.functionProviders[func.id] || 'local';
                  const hasKey = hasValidApiKey(currentProvider);
                  return (
                    <div key={func.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{func.icon}</span>
                          <div>
                            <p className="font-bold text-white">{func.name}</p>
                            <p className="text-xs text-white/40">{func.description}</p>
                          </div>
                        </div>
                      </div>
                      <select
                        value={currentProvider}
                        onChange={(e) => handleFunctionProviderChange(func.id, e.target.value as AIProvider)}
                        className={cn(
                          "w-full bg-white/5 border rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer focus:outline-none transition-all",
                          !hasKey && currentProvider !== 'local' ? "border-yellow-500/30 text-yellow-400" : "border-white/10 text-white focus:border-purple-500/40"
                        )}
                      >
                        {(['zai', 'local', 'groq', 'openrouter', 'openai', 'huggingface', 'gemini'] as AIProvider[]).map((p) => (
                          <option key={p} value={p} className="bg-[#0a0f1a] text-white">
                            {PROVIDERS[p].name}{p !== 'local' && !config.apiKeys[p] ? ' (pas de clé)' : ''}
                          </option>
                        ))}
                      </select>
                      {!hasKey && currentProvider !== 'local' && (
                        <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Clé API manquante → fallback local utilisé
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Mémoire Partagée des Agents</h3>
                <button
                  onClick={handleSaveMemory}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold text-xs transition-all",
                    memorySaveSuccess ? "bg-green-500 text-white" : "bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600"
                  )}
                >
                  {memorySaveSuccess ? 'Mémoire Sauvegardée !' : 'Enregistrer la mémoire'}
                </button>
              </div>
              <p className="text-xs text-white/40">Ces instructions personnalisées seront partagées et injectées dans le contexte de tous les agents IA (Psy, Coach, Nutrition, Assistant).</p>
              <textarea
                value={userMemoryInput}
                onChange={(e) => setUserMemoryInput(e.target.value)}
                placeholder="Exemple: Je m'appelle Llen, j'adore Francis Cabrel, j'aimerais me concentrer sur mon cardio cette semaine..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 h-32 focus:outline-none focus:border-purple-500/40 focus:bg-purple-500/5 transition-all text-white placeholder:text-white/20 resize-none text-sm leading-relaxed"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", "bg-gradient-to-br from-gray-500 to-slate-500")}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">Mode Local (Fallback)</p>
                  <p className="text-sm text-white/60">Sans clé API configurée, le mode local utilise des algorithmes de fallback pour générer des réponses pertinentes. Moins puissant mais toujours disponible.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

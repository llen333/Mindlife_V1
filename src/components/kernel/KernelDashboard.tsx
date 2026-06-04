'use client';

import { useState, useEffect, useCallback } from 'react';
import { kernelClient } from '@/lib/kernel-client';
import { Cpu } from 'lucide-react';
import MindLifeHeader from '@/components/MindLifeHeader';

interface ModuleInfo {
  id: string;
  name: string;
  manifest?: any;
  tools?: { name: string; description: string }[];
  skills?: { id: string; name: string }[];
}

interface KernelStatusData {
  uptime: number;
  modules: number;
  agents: number;
  memory: number;
  connections: number;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  moduleId: string;
  action: string;
  result: string;
}

export default function KernelDashboard() {
  const [status, setStatus] = useState<KernelStatusData | null>(null);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [selected, setSelected] = useState<ModuleInfo | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      await kernelClient.connect();
      const [rawStatus, rawModules, rawAudit] = await Promise.all([
        kernelClient.call('kernel.status'),
        kernelClient.listModules(),
        kernelClient.call('security.audit.recent', { limit: 10 }).catch(() => []),
      ]);
      setStatus(rawStatus as KernelStatusData);
      setModules(rawModules as ModuleInfo[]);
      setAudit(Array.isArray(rawAudit) ? rawAudit as AuditEntry[] : []);
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion au kernel');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectModule = async (id: string) => {
    try {
      const info = await kernelClient.call('module.info', { moduleId: id }) as ModuleInfo;
      setSelected(info);
    } catch {
      setSelected(null);
    }
  };

  const formatUptime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m ${s % 60}s`;
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <MindLifeHeader title="Kernel" icon={Cpu} />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
            <button onClick={load} className="ml-4 underline hover:text-red-300">Réessayer</button>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Uptime', value: status ? formatUptime(status.uptime) : '…', icon: '⏱️' },
            { label: 'Modules', value: status?.modules ?? '…', icon: '🧩' },
            { label: 'Connexions', value: status?.connections ?? '…', icon: '🔗' },
            { label: 'Mémoire', value: status ? formatMemory(status.memory) : '…', icon: '💾' },
          ].map((card) => (
            <div key={card.label} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">{card.icon}</div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-xs text-slate-400 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module List */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h2 className="text-sm font-semibold text-white mb-4">🧩 Modules chargés</h2>
            {modules.length === 0 ? (
              <p className="text-slate-400 text-sm">Aucun module chargé</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {modules.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectModule(m.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-left text-slate-300 hover:text-white transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium">{m.name}</span>
                    <span className="text-slate-500 text-xs">{m.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Module Detail */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h2 className="text-sm font-semibold text-white mb-4">📋 Détail module</h2>
            {!selected ? (
              <p className="text-slate-400 text-sm">Cliquez sur un module pour voir ses détails</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-bold text-white">{selected.name}</p>
                  <p className="text-xs text-slate-400">ID: {selected.id}</p>
                </div>
                {selected.manifest && (
                  <div>
                    <p className="text-xs text-slate-500">Version: {selected.manifest.version}</p>
                    <p className="text-xs text-slate-500">{selected.manifest.description}</p>
                    {selected.manifest.permissions && (
                      <div className="mt-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Permissions</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.manifest.permissions.map((p: string) => (
                            <span key={p} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selected.tools && selected.tools.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Outils ({selected.tools.length})</p>
                    {selected.tools.map((t) => (
                      <div key={t.name} className="text-xs text-slate-400">• {t.name}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Audit Log */}
        {audit.length > 0 && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h2 className="text-sm font-semibold text-white mb-4">📜 Audit récent</h2>
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {audit.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 text-xs text-slate-400 py-1">
                  <span className="text-slate-600 w-16 shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    entry.result === 'success' ? 'bg-emerald-500' :
                    entry.result === 'denied' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  <span className="font-medium text-slate-300 w-24 shrink-0">{entry.moduleId}</span>
                  <span className="truncate">{entry.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-all"
          >
            🔄 Rafraîchir
          </button>
        </div>
      </div>
    </div>
  );
}

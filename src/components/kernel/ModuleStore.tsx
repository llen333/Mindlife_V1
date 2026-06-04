'use client';

import { useState, useEffect, useCallback } from 'react';
import { kernelClient } from '@/lib/kernel-client';
import { Package } from 'lucide-react';
import MindLifeHeader from '@/components/MindLifeHeader';

interface PackageInfo {
  id: string;
  name: string;
  version: string;
  description: string | null;
  author: string | null;
  source: string | null;
  isInstalled: boolean;
  manifest: any;
}

export default function ModuleStorePage() {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async (query?: string) => {
    setError(null);
    try {
      await kernelClient.connect();
      const result = query
        ? await kernelClient.call('store.search', { query })
        : await kernelClient.call('store.list');
      setPackages(Array.isArray(result) ? result as PackageInfo[] : []);
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const install = async (name: string) => {
    try {
      await kernelClient.call('store.install', { name });
      setActionMsg(`✅ Module "${name}" installé`);
      setTimeout(() => setActionMsg(null), 3000);
      load();
    } catch (e: any) {
      setActionMsg(`❌ Erreur: ${e.message}`);
    }
  };

  const uninstall = async (name: string) => {
    try {
      await kernelClient.call('store.uninstall', { name });
      setActionMsg(`🗑️ Module "${name}" désinstallé`);
      setTimeout(() => setActionMsg(null), 3000);
      load();
    } catch (e: any) {
      setActionMsg(`❌ Erreur: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <MindLifeHeader title="Module Store" icon={Package} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
            <button onClick={() => load()} className="ml-4 underline">Réessayer</button>
          </div>
        )}

        {actionMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
            {actionMsg}
          </div>
        )}

        {/* Search + Actions */}
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(search)}
            placeholder="Rechercher un module…"
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 outline-none focus:border-emerald-500/40 transition-all"
          />
          <button
            onClick={() => load(search)}
            className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-all"
          >
            🔍 Chercher
          </button>
          <button
            onClick={() => { setSearch(''); load(); }}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm hover:bg-white/10 transition-all"
          >
            📋 Tous
          </button>
        </div>

        {/* Package List */}
        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-slate-400 text-sm">Aucun module dans le store</p>
            <p className="text-slate-500 text-xs mt-2">Utilisez l'API store.register pour ajouter des modules</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{pkg.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{pkg.version}</span>
                    {pkg.isInstalled && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Installé</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{pkg.description || 'Aucune description'}</p>
                  {pkg.author && (
                    <p className="text-[10px] text-slate-500 mt-1">Par {pkg.author}</p>
                  )}
                  {pkg.manifest?.permissions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pkg.manifest.permissions.map((p: string) => (
                        <span key={p} className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 text-[9px]">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {pkg.isInstalled ? (
                    <button
                      onClick={() => uninstall(pkg.name)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all"
                    >
                      Désinstaller
                    </button>
                  ) : (
                    <button
                      onClick={() => install(pkg.name)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-all"
                    >
                      Installer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

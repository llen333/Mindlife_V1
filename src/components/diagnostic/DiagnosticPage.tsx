'use client';

import { useState, useEffect } from 'react';
import { Activity, Cpu, Wifi, Layers, ArrowRight } from 'lucide-react';
import { kernelClient } from '@/lib/kernel-client';
import { listPanels, listSections } from '@/lib/ui-registry';
import { useNavigationActions } from '@/lib/store/selectors';

export default function DiagnosticPage() {
  const { setActivePanel } = useNavigationActions();
  const [kernelOk, setKernelOk] = useState<boolean | null>(null);

  useEffect(() => {
    kernelClient.ping().then(setKernelOk).catch(() => setKernelOk(false));
  }, []);

  const panels = listPanels();
  const sections = listSections();
  const stats = [
    { label: 'Panneaux', value: panels.length, icon: Layers, color: 'text-blue-400' },
    { label: 'Sections', value: sections.length, icon: Activity, color: 'text-emerald-400' },
    { label: 'Kernel', value: kernelOk === null ? '…' : kernelOk ? 'OK' : 'OFF', icon: Cpu, color: kernelOk ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Placeholder', value: panels.filter(p => p.placeholder).length, icon: Wifi, color: 'text-amber-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-emerald-400" />
        <h1 className="text-xl font-bold text-white">Diagnostic</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-slate-400 uppercase tracking-wider">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white/5 rounded-lg border border-white/10">
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Modules enregistrés</h2>
        </div>
        <div className="divide-y divide-white/5">
          {sections.map(section => (
            <div key={section}>
              <div className="px-4 py-2 bg-white/[0.02]">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{section}</span>
              </div>
              {panels.filter(p => p.section === section).map(p => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePanel(p.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all text-left"
                  >
                    <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="flex-1">{p.label}</span>
                    {p.placeholder && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">Bientôt</span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 rounded-lg border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Kernel</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${kernelOk ? 'bg-emerald-500' : kernelOk === null ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-slate-400">
            {kernelOk === null ? 'Vérification…' : kernelOk ? 'Kernel connecté sur ws://localhost:3091' : 'Kernel inaccessible'}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 italic">
        Ce panneau est un module de test enregistré dynamiquement via registerPanel(). 
        Il prouve que le ModuleRenderer découvre et affiche automatiquement les nouveaux modules.
      </p>
    </div>
  );
}

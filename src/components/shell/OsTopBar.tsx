'use client';

import { useState, useEffect } from 'react';
import { Cpu, Wifi, WifiOff } from 'lucide-react';
import { kernelClient } from '@/lib/kernel-client';

type Status = 'connected' | 'connecting' | 'disconnected';

export default function OsTopBar({ title, icon: Icon }: { title: string; icon?: React.ComponentType<{ className?: string }> }) {
  const [status, setStatus] = useState<Status>('connecting');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let mounted = true;
    const check = async () => {
      try {
        const ok = await kernelClient.ping();
        if (!mounted) return;
        setStatus(ok ? 'connected' : 'disconnected');
      } catch {
        if (mounted) setStatus('disconnected');
      }
    };
    check();
    interval = setInterval(check, 15000);
    kernelClient.connect().catch(() => { if (mounted) setStatus('disconnected'); });
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <header className="h-12 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0f1a]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-emerald-400" />}
        <h1 className="text-sm font-semibold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/5">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'connected' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' :
            status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-[10px] text-slate-500">
            {status === 'connected' ? 'Connecté' : status === 'connecting' ? '…' : 'Hors ligne'}
          </span>
        </div>
      </div>
    </header>
  );
}

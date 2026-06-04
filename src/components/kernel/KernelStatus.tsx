'use client';

import { useState, useEffect } from 'react';
import { kernelClient } from '@/lib/kernel-client';

type Status = 'connected' | 'connecting' | 'disconnected';

export default function KernelStatus() {
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
    interval = setInterval(check, 10000);

    kernelClient.connect().catch(() => {
      if (mounted) setStatus('disconnected');
    });

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const colors = {
    connected: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    connecting: 'bg-amber-500 animate-pulse',
    disconnected: 'bg-red-500',
  };

  const labels = {
    connected: 'Kernel connecté',
    connecting: 'Connexion…',
    disconnected: 'Kernel hors ligne',
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-white/5">
      <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
      <span className="text-[10px] text-slate-400">{labels[status]}</span>
    </div>
  );
}

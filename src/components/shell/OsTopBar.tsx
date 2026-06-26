'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { Cpu } from 'lucide-react';
import { kernelClient } from '@/lib/kernel-client';
import { useUserProfile } from '@/lib/store/selectors';

type Status = 'connected' | 'connecting' | 'disconnected';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function OsTopBar({ title, icon: Icon }: { title: string; icon?: React.ComponentType<{ className?: string }> }) {
  const [status, setStatus] = useState<Status>('connecting');
  const [currentTime, setCurrentTime] = useState(new Date());
  const userProfile = useUserProfile();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let mountedFlag = true;
    const check = async () => {
      try {
        const ok = await kernelClient.ping();
        if (!mountedFlag) return;
        setStatus(ok ? 'connected' : 'disconnected');
      } catch {
        if (mountedFlag) setStatus('disconnected');
      }
    };
    check();
    interval = setInterval(check, 15000);
    kernelClient.connect().catch(() => { if (mountedFlag) setStatus('disconnected'); });
    return () => { mountedFlag = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date: Date) => {
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNum} ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
  };

  return (
    <header className="h-12 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-[#0a0f1a]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400 flex-shrink-0" />}
        <h1 className="text-sm font-semibold text-white truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Clock */}
        {mounted && (
          <div className="hidden sm:flex items-center gap-2 text-right">
            <span
              suppressHydrationWarning
              className="text-xs font-semibold text-emerald-400 tabular-nums"
            >
              {formatTime(currentTime)}
            </span>
            <span
              suppressHydrationWarning
              className="text-[9px] text-white/40 uppercase tracking-wider hidden md:inline"
            >
              {formatDate(currentTime)}
            </span>
          </div>
        )}

        {/* User Avatar */}
        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg border border-white/10 overflow-hidden flex-shrink-0">
          {userProfile?.avatar ? (
            <img
              src={userProfile.avatar}
              alt={userProfile.name || 'Avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">
                {(userProfile?.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Kernel Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
          <Cpu className="w-3 h-3 text-slate-400" />
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'connected' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' :
            status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-[9px] text-slate-500 hidden lg:inline">
            {status === 'connected' ? 'Connecté' : status === 'connecting' ? '…' : 'Hors ligne'}
          </span>
        </div>
      </div>
    </header>
  );
}

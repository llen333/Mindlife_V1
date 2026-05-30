// KpiModal - Modal showing detailed biometrics
'use client';

import { Scale, Activity, Dumbbell } from 'lucide-react';
import { ModalTransparent } from './ModalTransparent';
import type { Biometrics, WorkoutSession } from '../types';

interface KpiModalProps {
  isVisible: boolean;
  onClose: () => void;
  biometrics: Biometrics | null;
  userProfile: { weight?: number } | null;
  sessionsHistory: WorkoutSession[];
}

export function KpiModal({ isVisible, onClose, biometrics, userProfile, sessionsHistory }: KpiModalProps) {
  if (!isVisible) return null;

  const completedSessions = sessionsHistory.filter(s => s.status === 'completed').length;

  return (
    <ModalTransparent onClose={onClose} large>
      <h3 className="text-xl font-black uppercase mb-6">Détail Biométrie</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Poids */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-4 h-4 text-[#00f2ff]" />
            <span className="text-sm font-bold">Poids</span>
          </div>
          <p className="text-3xl font-black mb-2">
            {biometrics?.weight?.toFixed(1) || userProfile?.weight?.toFixed(1) || '75.0'} kg
          </p>
          <svg className="w-full h-16" viewBox="0 0 200 50">
            <path d="M0,30 Q50,35 100,25 Q150,15 200,20" fill="none" stroke="#00f2ff" strokeWidth="2" />
          </svg>
          <p className="text-xs text-[#00f2ff] mt-2">Dernière mesure</p>
        </div>

        {/* Muscle */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#00f2ff]" />
            <span className="text-sm font-bold">Masse Musculaire</span>
          </div>
          <p className="text-3xl font-black mb-2">{biometrics?.muscleMass?.toFixed(1) || '38.4'} kg</p>
          <svg className="w-full h-16" viewBox="0 0 200 50">
            <path d="M0,40 Q50,35 100,30 Q150,25 200,20" fill="none" stroke="#00f2ff" strokeWidth="2" />
          </svg>
          <p className="text-xs text-green-400 mt-2">+0.3 kg ce mois</p>
        </div>

        {/* Sessions */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-4 h-4 text-[#00f2ff]" />
            <span className="text-sm font-bold">Sessions</span>
          </div>
          <p className="text-3xl font-black mb-2">{completedSessions}</p>
          <svg className="w-full h-16" viewBox="0 0 200 50">
            <path d="M0,20 L40,35 L80,25 L120,40 L160,30 L200,35" fill="none" stroke="#00f2ff" strokeWidth="2" />
          </svg>
          <p className="text-xs text-[#00f2ff] mt-2">4 sessions cette semaine</p>
        </div>
      </div>

      {/* Main chart */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <p className="text-sm font-bold mb-4">Progression globale</p>
        <svg className="w-full h-40" viewBox="0 0 800 120">
          <defs>
            <linearGradient id="mainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 242, 255, 0.5)" />
              <stop offset="100%" stopColor="rgba(0, 242, 255, 0)" />
            </linearGradient>
          </defs>
          <path d="M0,100 C100,90 200,60 300,70 C400,80 500,40 600,50 C700,60 750,30 800,20 L800,120 L0,120 Z" fill="url(#mainGrad)" />
          <path d="M0,100 C100,90 200,60 300,70 C400,80 500,40 600,50 C700,60 750,30 800,20" fill="none" stroke="#00f2ff" strokeWidth="2" />
          {[0, 200, 400, 600, 800].map((x, i) => (
            <circle key={i} cx={x} cy={[100, 85, 65, 45, 20][i]} r="4" fill="#00f2ff" />
          ))}
        </svg>
      </div>
    </ModalTransparent>
  );
}

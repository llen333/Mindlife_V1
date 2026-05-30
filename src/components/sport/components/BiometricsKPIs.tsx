// BiometricsKPIs - Biometrics display cards
'use client';

import { Scale, Activity, Droplets, Zap, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Biometrics } from '../types';

interface BiometricsKPIsProps {
  biometrics: Biometrics | null;
  userProfile: { weight?: number } | null;
  onOpenKpi: (key: string) => void;
  yScaleHover: (el: HTMLElement | null) => void;
}

export function BiometricsKPIs({ biometrics, userProfile, onOpenKpi, yScaleHover }: BiometricsKPIsProps) {
  const kpis = [
    {
      icon: Scale,
      label: 'Poids',
      value: biometrics?.weight?.toFixed(2) || userProfile?.weight?.toFixed(2) || '75.00',
      unit: 'KG',
      key: 'weight'
    },
    {
      icon: Activity,
      label: 'Muscle',
      value: biometrics?.muscleMass?.toFixed(2) || '38.45',
      unit: 'KG',
      key: 'muscleMass'
    },
    {
      icon: Droplets,
      label: 'Hydratation',
      value: biometrics?.hydration?.toFixed(1) || '64.2',
      unit: '%',
      key: 'hydration'
    },
    {
      icon: Zap,
      label: 'Potentiel Neuro',
      value: biometrics?.energyLevel?.toString() || '98',
      unit: '%',
      key: 'energyLevel'
    }
  ];

  return (
    <section>
      <h3 className="text-2xl lg:text-4xl font-extrabold tracking-tighter uppercase mb-6 lg:mb-8">
        Biométrie Tactique
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            ref={yScaleHover}
            onClick={() => onOpenKpi(kpi.key)}
            className={cn(
              "rounded-3xl p-4 lg:p-6 border border-[#00f2ff]/15 bg-gradient-to-br from-white/[0.04] to-transparent cursor-pointer transition-all hover:border-[#00f2ff]/40",
              i === 3 && "bg-[#00f2ff]/5 border-[#00f2ff]/20"
            )}
          >
            <div className="flex justify-between items-start mb-4 lg:mb-6">
              <kpi.icon className={cn("w-4 h-4 lg:w-5 lg:h-5", i === 3 ? "text-[#00f2ff]" : "text-[#00f2ff]/60")} />
              <Eye className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-2xl lg:text-4xl font-black">
              {kpi.value}<span className="text-xs text-white/30 ml-1">{kpi.unit}</span>
            </p>
            <p className="text-[8px] text-white/30 uppercase mt-2">{kpi.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

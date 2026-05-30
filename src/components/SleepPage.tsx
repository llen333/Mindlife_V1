'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { 
  Heart, 
  Moon, 
  Clock, 
  Zap, 
  TrendingUp, 
  Battery, 
  Info, 
  Plus, 
  Trash2, 
  Calendar, 
  Star, 
  Smile, 
  X 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { useStore } from '@/lib/stores';

// Circular Progress Component
function CircularProgress({ value, size = 120, strokeWidth = 8, color = '#10b981', label }: { 
  value: number; 
  size?: number; 
  strokeWidth?: number; 
  color?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(51, 65, 85, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-white">{value}</span>
        {label && <span className="text-[10px] text-slate-400 font-medium">{label}</span>}
      </div>
    </div>
  );
}

// Battery Component
function BatteryIndicator({ level }: { level: number }) {
  return (
    <div className="w-full h-6 rounded-full bg-slate-800 overflow-hidden flex items-center p-1 border border-white/5">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-400 flex items-center justify-end pr-2 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(10, level))}%` }}
      >
        {level >= 80 && <Zap className="w-3 h-3 text-white" />}
      </div>
    </div>
  );
}

export default function SleepPage() {
  const { sleepEntries = [], addSleepEntry, deleteSleepEntry } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'derniere' | 'semaine'>('derniere');
  const [showLogModal, setShowLogModal] = useState(false);

  // Form State
  const [bedtimeDate, setBedtimeDate] = useState('');
  const [bedtimeTime, setBedtimeTime] = useState('22:30');
  const [wakeupDate, setWakeupDate] = useState('');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState('');

  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const graphCardRef = useRef<HTMLDivElement>(null);
  const logSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set default dates to today/yesterday for bedtime
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setBedtimeDate(yesterday);
    setWakeupDate(today);
  }, []);

  useEffect(() => {
    // Staggered entrance animation
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (headerRef.current) tl.fromTo(headerRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 });
    if (cardsGridRef.current) tl.fromTo(cardsGridRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.2');
    if (graphCardRef.current) tl.fromTo(graphCardRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');
    if (logSectionRef.current) tl.fromTo(logSectionRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');
  }, [sleepEntries.length]);

  // Aggregate stats
  const latestEntry = sleepEntries[0];
  const totalEntries = sleepEntries.length;

  const avgDuration = totalEntries > 0
    ? Math.round((sleepEntries.reduce((acc, curr) => acc + curr.duration, 0) / totalEntries) * 10) / 10
    : 7.5;

  const avgQuality = totalEntries > 0
    ? Math.round((sleepEntries.reduce((acc, curr) => acc + curr.quality, 0) / totalEntries) * 10) / 10
    : 4.0;

  // Calculate score (out of 100) based on duration and quality
  // Target duration = 8 hours (gets max score)
  const calculateSleepScore = (duration: number, qual: number) => {
    const durationScore = Math.max(0, 100 - Math.abs(8 - duration) * 15);
    const qualityScore = qual * 20;
    return Math.round((durationScore + qualityScore) / 2);
  };

  const latestScore = latestEntry 
    ? calculateSleepScore(latestEntry.duration, latestEntry.quality)
    : 85;

  const avgScore = totalEntries > 0
    ? Math.round(sleepEntries.reduce((acc, curr) => acc + calculateSleepScore(curr.duration, curr.quality), 0) / totalEntries)
    : 82;

  // Prepare chart data (last 7 entries)
  const chartData = [...sleepEntries]
    .slice(0, 7)
    .reverse()
    .map(entry => {
      const dateObj = new Date(entry.date);
      const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' });
      return {
        name: dayName,
        duration: entry.duration,
        quality: entry.quality,
        score: calculateSleepScore(entry.duration, entry.quality),
        rawDate: entry.date,
      };
    });

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedtimeDate || !bedtimeTime || !wakeupDate || !wakeupTime) return;

    const bedtimeIso = `${bedtimeDate}T${bedtimeTime}:00`;
    const wakeupIso = `${wakeupDate}T${wakeupTime}:00`;

    await addSleepEntry({
      date: wakeupDate,
      bedtime: bedtimeIso,
      wakeup: wakeupIso,
      quality,
      notes: notes.trim() || null,
    });

    setNotes('');
    setShowLogModal(false);
  };

  // Helper formatting bedtime and wakeup time
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] pl-[70px] pt-20 pb-12 text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Panel */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-xs text-violet-400 font-bold uppercase tracking-wider">MindLife Sommeil</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Optimisation du Sommeil</h1>
            <p className="text-sm text-slate-400 mt-1">Suivez, analysez et améliorez votre récupération nocturne pour des journées optimales.</p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            Enregistrer ma Nuit
          </button>
        </div>

        {/* Period selection */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('derniere')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                selectedPeriod === 'derniere'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-inner'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              Nuit dernière
            </button>
            <button
              onClick={() => setSelectedPeriod('semaine')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                selectedPeriod === 'semaine'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-inner'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              Moyenne Hebdomadaire
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-violet-400" />
            <span>Objectif recommandé : 8 heures par nuit</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div ref={cardsGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Circular Score */}
          <div className="mindlife-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all duration-700" />
            <CircularProgress
              value={selectedPeriod === 'derniere' ? latestScore : avgScore}
              size={130}
              color="#8b5cf6"
              label="/ 100"
            />
            <p className="text-sm font-bold text-violet-400 mt-4 tracking-wider">
              {(selectedPeriod === 'derniere' ? latestScore : avgScore) >= 80 ? 'RECUPÉRATION EXCELLENTE' : 'RÉCUPÉRATION MOYENNE'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Score global du sommeil</p>
          </div>

          {/* Card 2: Rest Duration */}
          <div className="mindlife-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all duration-700" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Durée de repos</span>
                <span className="text-2xl font-black text-white">
                  {selectedPeriod === 'derniere' 
                    ? (latestEntry ? `${latestEntry.duration} hrs` : '-- hrs') 
                    : `${avgDuration} hrs`
                  }
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Objectif: 8h</span>
                <span className="text-indigo-400 font-bold">
                  {selectedPeriod === 'derniere'
                    ? (latestEntry ? `${Math.round((latestEntry.duration / 8) * 100)}%` : '0%')
                    : `${Math.round((avgDuration / 8) * 100)}%`
                  }
                </span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-400 rounded-full transition-all duration-700"
                  style={{ 
                    width: `${Math.min(100, Math.round((
                      selectedPeriod === 'derniere' 
                        ? (latestEntry ? latestEntry.duration : 0) 
                        : avgDuration
                    ) / 8 * 100))}%` 
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>Sommeil régulier & récupérateur</span>
            </div>
          </div>

          {/* Card 3: Quality Star / Battery */}
          <div className="mindlife-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/20 transition-all duration-700" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Smile className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Qualité du Sommeil</span>
                <span className="text-2xl font-black text-white">
                  {selectedPeriod === 'derniere'
                    ? (latestEntry ? `${latestEntry.quality} / 5` : '-- / 5')
                    : `${avgQuality} / 5`
                  }
                </span>
              </div>
            </div>

            {/* Stars row */}
            <div className="flex gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((star) => {
                const currentVal = selectedPeriod === 'derniere' 
                  ? (latestEntry ? latestEntry.quality : 0)
                  : avgQuality;
                return (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= currentVal 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-slate-600'
                    }`}
                  />
                );
              })}
            </div>

            <BatteryIndicator 
              level={Math.round((selectedPeriod === 'derniere' 
                ? (latestEntry ? latestEntry.quality : 4) 
                : avgQuality
              ) * 20)} 
            />
          </div>

        </div>

        {/* Charts & Graphs Panel */}
        <div ref={graphCardRef} className="mindlife-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Historique Récent</h2>
              <p className="text-xs text-slate-400">Évolution de la durée et de la qualité sur les 7 derniers enregistrements</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-slate-300">Durée (heures)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400" />
                <span className="text-slate-300">Score global</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sleepDurationGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="sleepScoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 15, 26, 0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      color: '#f8fafc',
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="duration"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#sleepDurationGrad)"
                    name="Durée (h)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#sleepScoreGrad)"
                    strokeDasharray="4 4"
                    name="Score global"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center text-slate-500 border border-dashed border-white/5 rounded-2xl bg-white/2">
                <Moon className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
                <span className="text-sm font-medium">Aucune donnée disponible</span>
                <span className="text-[11px] text-slate-600 mt-1">Enregistrez votre première nuit pour générer le graphique.</span>
              </div>
            )}
          </div>
        </div>

        {/* History Log Section */}
        <div ref={logSectionRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* History List */}
          <div className="md:col-span-2 mindlife-card p-6">
            <h2 className="text-lg font-bold text-white mb-4 tracking-tight">Journal des Nuits</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              
              {sleepEntries.length > 0 ? (
                sleepEntries.map((entry) => {
                  const score = calculateSleepScore(entry.duration, entry.quality);
                  return (
                    <div 
                      key={entry.id} 
                      className="p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-400 mt-1">
                          <Moon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white">{formatDate(entry.wakeup)}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-semibold">
                              {entry.duration} hrs
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                              score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              Score: {score}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
                            <span>Coucher: {formatTime(entry.bedtime)}</span>
                            <span>Réveil: {formatTime(entry.wakeup)}</span>
                          </div>
                          
                          {entry.notes && (
                            <p className="text-[11px] text-slate-400 italic mt-2 bg-black/20 p-2 rounded-lg border border-white/2">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= entry.quality 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <button
                          onClick={() => deleteSleepEntry(entry.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                          title="Supprimer la nuit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Moon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Aucune nuit enregistrée</p>
                  <p className="text-xs text-slate-600 mt-1">Utilisez le bouton en haut pour loguer votre sommeil.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Tips & Health Sidebar */}
          <div className="space-y-6">
            
            {/* AI Insights */}
            <div className="mindlife-card p-5 border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-transparent relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/5 rounded-full blur-xl" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Oracle Santé AI</h3>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {avgDuration < 7 
                  ? "Votre moyenne de sommeil hebdomadaire est inférieure au minimum de 7 heures recommandé pour les sportifs et les professionnels. Essayez d'avancer votre coucher de 15 minutes chaque jour pour récupérer."
                  : "Excellent maintien de votre rythme de sommeil ! Votre régularité contribue directement à la clarté mentale et à la récupération musculaire."
                }
              </p>
              
              <div className="flex gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 font-semibold border border-violet-500/20">
                  +18% focus mental
                </span>
              </div>
            </div>

            {/* Hygiene Checklist */}
            <div className="mindlife-card p-5">
              <h3 className="text-sm font-bold text-white mb-4 tracking-wider uppercase">Hygiène Nocturne</h3>
              <div className="space-y-3.5 text-xs text-slate-400">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5" />
                  <p>Pas d'écrans bleus 45 min avant de dormir</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5" />
                  <p>Chambre fraîche maintenue à 18°C</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5" />
                  <p>Éviter la caféine après 14h00</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5" />
                  <p>Dîner léger au moins 2.5h avant le coucher</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Saisie Modal / Pop-in */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl bg-[#0d1322] border border-white/10 p-6 shadow-2xl relative overflow-hidden transform transition-all duration-300">
              
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-violet-400" />
                  <h3 className="text-lg font-bold text-white">Log Sommeil</h3>
                </div>
                <button 
                  onClick={() => setShowLogModal(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Bedtime Fields */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date & Heure de Coucher</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="date" 
                      value={bedtimeDate}
                      onChange={(e) => setBedtimeDate(e.target.value)}
                      className="bg-slate-900 border border-white/5 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
                      required 
                    />
                    <input 
                      type="time" 
                      value={bedtimeTime}
                      onChange={(e) => setBedtimeTime(e.target.value)}
                      className="bg-slate-900 border border-white/5 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
                      required 
                    />
                  </div>
                </div>

                {/* Wakeup Fields */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date & Heure de Réveil</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="date" 
                      value={wakeupDate}
                      onChange={(e) => setWakeupDate(e.target.value)}
                      className="bg-slate-900 border border-white/5 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
                      required 
                    />
                    <input 
                      type="time" 
                      value={wakeupTime}
                      onChange={(e) => setWakeupTime(e.target.value)}
                      className="bg-slate-900 border border-white/5 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
                      required 
                    />
                  </div>
                </div>

                {/* Sleep Quality */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Qualité Perçue (1 - 5)</label>
                  <div className="flex items-center gap-3 bg-slate-900 border border-white/5 p-3 rounded-xl">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setQuality(stars)}
                          className="transform hover:scale-110 active:scale-95 transition-all"
                        >
                          <Star 
                            className={`w-7 h-7 ${
                              stars <= quality ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      {quality === 1 && 'Très mauvais'}
                      {quality === 2 && 'Médiocre'}
                      {quality === 3 && 'Correct'}
                      {quality === 4 && 'Bon'}
                      {quality === 5 && 'Excellent'}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Observations & Notes (optionnel)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Fatigue au réveil, rêves lucides, température de la chambre..."
                    rows={2}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white border border-white/5 hover:bg-slate-700 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-violet-900/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
                  >
                    Sauvegarder
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// SportPage - Main sport tracking page (refactored)
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Radar, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import MindLifeHeader from '../MindLifeHeader';

// Hooks
import { useGsapHover, useSportData } from './hooks';

// Components
import { SessionPanel, BiometricsKPIs, WeeklyCycle, AtlasIntelligence, HistoryPanel } from './components';

// Modals
import { StartSessionModal, KpiModal } from './modals';

// Constants
import { exercisesByWorkout, workoutByDay } from './constants';

// Types
import type { ProgramDay, Exercise } from './types';

export default function SportPage() {
  const {
    program,
    isLoading,
    todaySession,
    biometrics,
    atlasMessage,
    sessionsHistory,
    currentUserId,
    userProfile,
    loadUserProfile,
    sessionTimer,
    setSessionTimer,
    isTimerRunning,
    startTimer,
    stopTimer,
    loadData,
    startSession,
    toggleExerciseComplete,
    completeSession,
    fetchAtlasRecommendation,
  } = useSportData();

  // UI States
  const [showStartModal, setShowStartModal] = useState(false);
  const [showKpiModal, setShowKpiModal] = useState(false);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<Date>(new Date());

  // GSAP hover handlers
  const scaleHover = useGsapHover({ scale: 1.02 });
  const yHover = useGsapHover({ y: -4 });
  const yScaleHover = useGsapHover({ y: -4, scale: 1.02 });

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Index du jour actuel
  const currentDayIndex = new Date().getDay();
  const adjustedDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  // Load profile on mount
  useEffect(() => {
    if (!userProfile) {
      loadUserProfile();
    }
  }, [userProfile, loadUserProfile]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => setSessionTimer(t => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, setSessionTimer]);

  // Format timer
  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Get current day
  const getCurrentDay = (): ProgramDay | null => {
    if (!program?.days) return null;
    return program.days.find(d => d.dayOfWeek === adjustedDayIndex) || null;
  };

  // Get exercises for a date
  const getExercisesForDate = (date: Date): { main: Exercise[]; warmup: Exercise[]; cooldown: Exercise[]; workoutType: string } => {
    const dayOfWeek = date.getDay();
    const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const workoutType = workoutByDay[adjustedIndex] || 'REPOS';
    const workoutExercises = exercisesByWorkout[workoutType] || exercisesByWorkout['REPOS'];

    return {
      main: [...workoutExercises.main, ...workoutExercises.isolation, ...workoutExercises.bonus],
      warmup: workoutExercises.warmup,
      cooldown: workoutExercises.cooldown,
      workoutType
    };
  };

  // Get session for date
  const getSessionForDate = (date: Date) => {
    return sessionsHistory.find(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.toDateString() === date.toDateString();
    }) || null;
  };

  // Format date title
  const formatSelectedDateTitle = (date: Date): string => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) return "Session du Jour";

    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString('fr-FR', { month: 'long' });

    const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const monthCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return `${dayNameCapitalized} ${dayNum} ${monthCapitalized}`;
  };

  // Derived state
  const selectedSession = getSessionForDate(selectedHistoryDate);
  const isSelectedDateToday = selectedHistoryDate.toDateString() === new Date().toDateString();
  const isSessionInProgress = isSelectedDateToday && todaySession?.status === 'in_progress';
  const isSessionCompleted = selectedSession?.status === 'completed';
  const currentDay = getCurrentDay();
  const exercisesData = getExercisesForDate(selectedHistoryDate);

  // Handlers
  const handleStartSession = async () => {
    if (!currentDay) return;
    await startSession({
      id: currentDay.id,
      name: currentDay.name,
      intensity: currentDay.intensity,
      exercises: currentDay.exercises.length > 0 ? currentDay.exercises : exercisesData.main
    });
    setShowStartModal(false);
  };

  const handleCompleteSession = async () => {
    await completeSession();
  };

  const handleOpenKpi = () => setShowKpiModal(true);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 pt-20">
      {/* Header */}
      <MindLifeHeader
        title="MindLife"
        subtitle="Cockpit Bio-Tactique"
        icon={Radar}
        theme="cyan"
        showBackButton={true}
        rightContent={
          isSessionInProgress && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30">
              <Timer className="w-4 h-4 text-[#00f2ff] animate-pulse" />
              <span className="text-[#00f2ff] font-mono font-bold">{formatTimer(sessionTimer)}</span>
            </div>
          )
        }
      />

      {/* Main */}
      <main className="px-4 lg:px-10 py-6 lg:py-12 space-y-8 lg:space-y-16">
        {/* Session du Jour */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <SessionPanel
            session={isSelectedDateToday ? todaySession : selectedSession}
            workoutType={exercisesData.workoutType}
            exercises={exercisesData}
            sessionDuration={selectedSession?.duration}
            isSessionInProgress={isSessionInProgress}
            isSessionCompleted={isSessionCompleted}
            isSelectedDateToday={isSelectedDateToday}
            onStartSession={() => setShowStartModal(true)}
            onCompleteSession={handleCompleteSession}
            onToggleExercise={toggleExerciseComplete}
            scaleHover={scaleHover}
            yHover={yHover}
          />

          {/* History Panel */}
          <HistoryPanel
            sessionsHistory={sessionsHistory}
            selectedDate={selectedHistoryDate}
            onSelectDate={setSelectedHistoryDate}
          />
        </section>

        {/* KPIs Biométrie */}
        <BiometricsKPIs
          biometrics={biometrics}
          userProfile={userProfile}
          onOpenKpi={handleOpenKpi}
          yScaleHover={yScaleHover}
        />

        {/* Cycle Hebdo */}
        <WeeklyCycle
          days={program?.days || []}
          adjustedDayIndex={adjustedDayIndex}
          sessionsHistory={sessionsHistory}
          onOpenDayDetail={() => {}}
          yHover={yHover}
        />

        {/* Atlas Intelligence */}
        <AtlasIntelligence
          message={atlasMessage}
          onFetchRecommendation={fetchAtlasRecommendation}
        />
      </main>

      {/* Modals */}
      <StartSessionModal
        isVisible={showStartModal}
        onClose={() => setShowStartModal(false)}
        onStart={handleStartSession}
      />

      <KpiModal
        isVisible={showKpiModal}
        onClose={() => setShowKpiModal(false)}
        biometrics={biometrics}
        userProfile={userProfile}
        sessionsHistory={sessionsHistory}
      />
    </div>
  );
}

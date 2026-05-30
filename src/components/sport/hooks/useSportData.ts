// useSportData - Hook for managing sport data
'use client';

import { useState, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import type { WeeklyProgram, WorkoutSession, Biometrics } from '../types';
import { defaultProgram } from '../constants';

export function useSportData() {
  const { currentUserId, userProfile, loadUserProfile } = useStore();

  const [program, setProgram] = useState<WeeklyProgram>(defaultProgram);
  const [isLoading, setIsLoading] = useState(true);
  const [todaySession, setTodaySession] = useState<WorkoutSession | null>(null);
  const [biometrics, setBiometrics] = useState<Biometrics | null>(null);
  const [atlasMessage, setAtlasMessage] = useState("");
  const [sessionsHistory, setSessionsHistory] = useState<WorkoutSession[]>([]);

  // Session states
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [programRes, sessionRes, bioRes] = await Promise.all([
        fetch(`/api/sport/program?userId=${currentUserId}`),
        fetch(`/api/sport/session?userId=${currentUserId}`),
        fetch(`/api/sport/biometrics?userId=${currentUserId}&days=150`)
      ]);

      const programData = await programRes.json();
      if (programData.program) setProgram(programData.program);

      const sessionData = await sessionRes.json();
      setTodaySession(sessionData.todaySession);
      setSessionsHistory(sessionData.sessions || []);

      const bioData = await bioRes.json();
      setBiometrics(bioData.latest);

      setIsLoading(false);

      // Load Atlas in background
      setAtlasMessage("Analyse en cours...");
      fetch(`/api/sport/atlas?userId=${currentUserId}`)
        .then(res => res.json())
        .then(data => {
          if (data.recommendation) setAtlasMessage(data.recommendation);
        })
        .catch(() => {
          setAtlasMessage("Prêt à analyser vos performances.");
        });
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Start session
  const startSession = useCallback(async (currentDay: { id: string; name: string; intensity: number | null; exercises: any[] }) => {
    if (!currentDay) return;

    try {
      const res = await fetch('/api/sport/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          dayId: currentDay.id,
          name: currentDay.name,
          status: 'in_progress',
          intensity: currentDay.intensity,
          exercises: currentDay.exercises.map((ex: any) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            order: ex.order
          }))
        })
      });
      const data = await res.json();
      if (data.session) {
        setTodaySession(data.session);
        setIsTimerRunning(true);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [currentUserId]);

  // Toggle exercise complete
  const toggleExerciseComplete = useCallback(async (exerciseId: string) => {
    if (!todaySession) return;
    const updatedExercises = todaySession.exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
    );
    try {
      await fetch('/api/sport/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: todaySession.id,
          exercises: updatedExercises
        })
      });
      setTodaySession({ ...todaySession, exercises: updatedExercises });
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  }, [todaySession]);

  // Complete session
  const completeSession = useCallback(async () => {
    if (!todaySession) return;
    try {
      await fetch('/api/sport/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: todaySession.id,
          status: 'completed',
          duration: Math.floor(sessionTimer / 60)
        })
      });
      setIsTimerRunning(false);
      setSessionTimer(0);
      loadData();
    } catch (error) {
      console.error('Error completing session:', error);
    }
  }, [todaySession, sessionTimer, loadData]);

  // Fetch Atlas recommendation
  const fetchAtlasRecommendation = useCallback(async (type: string) => {
    try {
      const res = await fetch('/api/sport/atlas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          context: {
            biometrics,
            sessionsCount: sessionsHistory.filter(s => s.status === 'completed').length,
            program
          }
        })
      });
      const data = await res.json();
      if (data.reply) setAtlasMessage(data.reply);
    } catch (error) {
      console.error('Error fetching Atlas:', error);
    }
  }, [biometrics, sessionsHistory, program]);

  // Timer management
  const startTimer = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  return {
    // Data
    program,
    setProgram,
    isLoading,
    todaySession,
    setTodaySession,
    biometrics,
    atlasMessage,
    sessionsHistory,
    currentUserId,
    userProfile,
    loadUserProfile,

    // Session
    sessionTimer,
    setSessionTimer,
    isTimerRunning,
    startTimer,
    stopTimer,

    // Actions
    loadData,
    startSession,
    toggleExerciseComplete,
    completeSession,
    fetchAtlasRecommendation,
  };
}

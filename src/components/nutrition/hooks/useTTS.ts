/**
 * useTTS Hook
 * Gestion du Text-to-Speech pour la lecture des recettes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Meal, VoiceId, ReadingModeId } from '../types';

interface UseTTSReturn {
  // State
  selectedVoice: VoiceId;
  readingMode: ReadingModeId;
  isPlaying: boolean;
  isPaused: boolean;
  isTTSLoding: boolean;
  availableVoices: SpeechSynthesisVoice[];
  
  // Actions
  setSelectedVoice: (voice: VoiceId) => void;
  setReadingMode: (mode: ReadingModeId) => void;
  speakRecipe: () => void;
  startSpeaking: (meal: Meal, stepIndex: number) => void;
  changeVoice: (voiceId: VoiceId) => void;
  changeReadingMode: (mode: ReadingModeId) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function useTTS(
  selectedMeal: Meal | null,
  currentStep: number,
  setCurrentStep: (step: number) => void
): UseTTSReturn {
  // State
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>('female-fr');
  const [readingMode, setReadingMode] = useState<ReadingModeId>('step');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTTSLoding, setIsTTSLoding] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Store latest values in refs to avoid dependency issues
  const selectedVoiceRef = useRef(selectedVoice);
  const readingModeRef = useRef(readingMode);
  const currentStepRef = useRef(currentStep);
  const selectedMealRef = useRef(selectedMeal);
  const isPlayingRef = useRef(isPlaying);
  const isPausedRef = useRef(isPaused);
  
  useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);
  useEffect(() => { readingModeRef.current = readingMode; }, [readingMode]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { selectedMealRef.current = selectedMeal; }, [selectedMeal]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // Load available voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    
    const timeoutId = setTimeout(loadVoices, 500);
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
      clearTimeout(timeoutId);
    };
  }, []);

  // Get French voice
  const getFrenchVoice = (preferMale: boolean): SpeechSynthesisVoice | null => {
    const voices = availableVoices.length > 0 ? availableVoices : speechSynthesis.getVoices();
    
    let frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
    
    if (frenchVoices.length === 0) {
      frenchVoices = voices.filter(v => 
        v.name.toLowerCase().includes('french') ||
        v.name.toLowerCase().includes('français') ||
        v.name.toLowerCase().includes('france')
      );
    }
    
    if (frenchVoices.length === 0) return null;
    
    const googleFr = frenchVoices.find(v => v.name.includes('Google') && v.lang.startsWith('fr'));
    if (googleFr) return googleFr;
    
    const keyword = preferMale ? ['male', 'homme', 'thomas', 'paul', 'pierre'] : ['female', 'femme', 'amélie', 'julie', 'marie', 'claire'];
    const voice = frenchVoices.find(v => 
      keyword.some(k => v.name.toLowerCase().includes(k)) || v.name.includes('Google')
    );
    
    return voice || frenchVoices[0];
  };

  // Get text to speak
  const getTextToSpeak = (meal: Meal, stepIndex: number, mode: ReadingModeId): string => {
    if (mode === 'step') {
      return `Étape ${stepIndex + 1}. ${meal.steps[stepIndex]?.instruction || ''}`;
    }
    const intro = `Voici la recette : ${meal.title}. `;
    const steps = meal.steps.map((s, i) => `Étape ${i + 1} : ${s.instruction}`).join('. ');
    return intro + steps;
  };

  // Core speak function
  const doSpeak = (meal: Meal, stepIndex: number, mode: ReadingModeId, voice: VoiceId) => {
    if (!meal) return;

    speechSynthesis.cancel();
    
    const text = getTextToSpeak(meal, stepIndex, mode);
    if (!text?.trim()) {
      setIsTTSLoding(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    const frVoice = getFrenchVoice(voice === 'male-fr');
    if (frVoice) utterance.voice = frVoice;
    
    utteranceRef.current = utterance;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setIsTTSLoding(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      
      if (mode === 'step' && meal.steps.length > stepIndex + 1) {
        setTimeout(() => {
          setCurrentStep(stepIndex + 1);
          doSpeak(meal, stepIndex + 1, mode, voice);
        }, 1000);
      }
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsTTSLoding(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  // Start speaking
  const startSpeaking = (meal: Meal, stepIndex: number) => {
    setIsTTSLoding(true);
    doSpeak(meal, stepIndex, readingModeRef.current, selectedVoiceRef.current);
  };

  // Speak recipe (play/pause toggle)
  const speakRecipe = () => {
    const meal = selectedMealRef.current;
    if (!meal) return;
    
    if (isPlayingRef.current) {
      speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else if (isPausedRef.current) {
      speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      speechSynthesis.cancel();
      setIsTTSLoding(true);
      doSpeak(meal, currentStepRef.current, readingModeRef.current, selectedVoiceRef.current);
    }
  };

  // Change voice
  const changeVoice = (voiceId: VoiceId) => {
    setSelectedVoice(voiceId);
    if ((isPlayingRef.current || isPausedRef.current) && selectedMealRef.current) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setTimeout(() => {
        doSpeak(selectedMealRef.current!, currentStepRef.current, readingModeRef.current, voiceId);
      }, 100);
    }
  };

  // Change reading mode
  const changeReadingMode = (mode: ReadingModeId) => {
    setReadingMode(mode);
    if ((isPlayingRef.current || isPausedRef.current) && selectedMealRef.current) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setTimeout(() => {
        doSpeak(selectedMealRef.current!, mode === 'full' ? 0 : currentStepRef.current, mode, selectedVoiceRef.current);
      }, 100);
    }
  };

  // Navigation
  const nextStep = () => {
    const meal = selectedMealRef.current;
    if (!meal || currentStepRef.current >= meal.steps.length - 1) return;
    
    speechSynthesis.cancel();
    const newStep = currentStepRef.current + 1;
    setCurrentStep(newStep);
    setIsPlaying(false);
    setIsPaused(false);
    
    setTimeout(() => {
      doSpeak(selectedMealRef.current!, newStep, readingModeRef.current, selectedVoiceRef.current);
    }, 100);
  };

  const prevStep = () => {
    if (currentStepRef.current <= 0) return;
    
    speechSynthesis.cancel();
    const newStep = currentStepRef.current - 1;
    setCurrentStep(newStep);
    setIsPlaying(false);
    setIsPaused(false);
    
    setTimeout(() => {
      doSpeak(selectedMealRef.current!, newStep, readingModeRef.current, selectedVoiceRef.current);
    }, 100);
  };

  return {
    selectedVoice,
    readingMode,
    isPlaying,
    isPaused,
    isTTSLoding,
    availableVoices,
    setSelectedVoice,
    setReadingMode,
    speakRecipe,
    startSpeaking,
    changeVoice,
    changeReadingMode,
    nextStep,
    prevStep,
  };
}

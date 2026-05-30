// Hook TTS (Text-to-Speech) pour la lecture vocale des recettes
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Meal } from '../types/nutrition';

interface UseTTSReturn {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentStep: number;
  selectedVoice: 'female-fr' | 'male-fr';
  readingMode: 'step' | 'full';
  availableVoices: SpeechSynthesisVoice[];
  startSpeaking: (meal: Meal, stepIndex: number) => void;
  speakRecipe: (meal: Meal | null) => void;
  stopSpeaking: () => void;
  changeVoice: (voiceId: 'female-fr' | 'male-fr') => void;
  changeReadingMode: (mode: 'step' | 'full') => void;
  nextStep: (meal: Meal | null) => void;
  prevStep: (meal: Meal | null) => void;
  setCurrentStep: (step: number) => void;
}

// Types internes pour éviter les dépendances circulaires
type StartSpeakingFn = (meal: Meal, stepIndex: number) => void;

export function useTTS(): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<'female-fr' | 'male-fr'>('female-fr');
  const [readingMode, setReadingMode] = useState<'step' | 'full'>('step');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentMealRef = useRef<Meal | null>(null);
  const startSpeakingRef = useRef<StartSpeakingFn | null>(null);

  // Charger les voix disponibles
  useEffect(() => {
    const loadVoices = () => {
      let voices = speechSynthesis.getVoices();
      
      if (voices.length === 0) {
        setTimeout(() => {
          voices = speechSynthesis.getVoices();
          if (voices.length > 0) {
            setAvailableVoices(voices);
          }
        }, 100);
      } else {
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

  // Obtenir une voix française
  const getFrenchVoice = useCallback((preferMale: boolean): SpeechSynthesisVoice | null => {
    const voices = availableVoices.length > 0 ? availableVoices : speechSynthesis.getVoices();
    
    let frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
    
    if (frenchVoices.length === 0) {
      frenchVoices = voices.filter(v => 
        v.name.toLowerCase().includes('french') ||
        v.name.toLowerCase().includes('français') ||
        v.name.toLowerCase().includes('france')
      );
    }
    
    if (frenchVoices.length === 0) {
      return null;
    }
    
    const googleFr = frenchVoices.find(v => v.name.includes('Google') && v.lang.startsWith('fr'));
    if (googleFr) return googleFr;
    
    if (preferMale) {
      const maleVoice = frenchVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('homme') ||
        v.name.toLowerCase().includes('thomas') ||
        v.name.toLowerCase().includes('paul') ||
        v.name.toLowerCase().includes('pierre') ||
        v.name.toLowerCase().includes('google')
      );
      if (maleVoice) return maleVoice;
    } else {
      const femaleVoice = frenchVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('femme') ||
        v.name.toLowerCase().includes('amélie') ||
        v.name.toLowerCase().includes('julie') ||
        v.name.toLowerCase().includes('marie') ||
        v.name.toLowerCase().includes('claire') ||
        v.name.toLowerCase().includes('google')
      );
      if (femaleVoice) return femaleVoice;
    }
    
    return frenchVoices[0];
  }, [availableVoices]);

  // Obtenir le texte à lire
  const getTextToSpeak = useCallback((meal: Meal, stepIndex: number, mode: 'step' | 'full'): string => {
    if (mode === 'step') {
      return `Étape ${stepIndex + 1}. ${meal.steps[stepIndex]?.instruction || ''}`;
    } else {
      const intro = `Voici la recette : ${meal.title}. `;
      const steps = meal.steps.map((s, i) => `Étape ${i + 1} : ${s.instruction}`).join('. ');
      return intro + steps;
    }
  }, []);

  // Démarrer la lecture
  const startSpeaking = useCallback((meal: Meal, stepIndex: number) => {
    if (!meal) {
      console.error('TTS Error: Pas de recette sélectionnée');
      return;
    }

    speechSynthesis.cancel();
    currentMealRef.current = meal;
    
    const text = getTextToSpeak(meal, stepIndex, readingMode);
    
    if (!text || text.trim().length === 0) {
      console.error('TTS Error: Texte vide');
      setIsLoading(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    const preferMale = selectedVoice === 'male-fr';
    const voice = getFrenchVoice(preferMale);
    if (voice) {
      utterance.voice = voice;
    }
    
    utteranceRef.current = utterance;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setIsLoading(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      
      if (readingMode === 'step' && meal.steps.length > stepIndex + 1) {
        setTimeout(() => {
          setCurrentStep(stepIndex + 1);
          if (currentMealRef.current && startSpeakingRef.current) {
            startSpeakingRef.current(currentMealRef.current, stepIndex + 1);
          }
        }, 1000);
      }
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };
    
    speechSynthesis.speak(utterance);
  }, [getTextToSpeak, readingMode, selectedVoice, getFrenchVoice]);

  // Mettre à jour la ref quand startSpeaking change
  useEffect(() => {
    startSpeakingRef.current = startSpeaking;
  }, [startSpeaking]);

  // Play/Pause
  const speakRecipe = useCallback((meal: Meal | null) => {
    if (!meal) return;
    
    if (isPlaying) {
      speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else if (isPaused) {
      speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      speechSynthesis.cancel();
      setIsLoading(true);
      startSpeaking(meal, currentStep);
    }
  }, [isPlaying, isPaused, currentStep, startSpeaking]);

  // Arrêter
  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    currentMealRef.current = null;
  }, []);

  // Changer de voix
  const changeVoice = useCallback((voiceId: 'female-fr' | 'male-fr') => {
    setSelectedVoice(voiceId);
    if ((isPlaying || isPaused) && currentMealRef.current) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setTimeout(() => {
        if (currentMealRef.current) {
          startSpeaking(currentMealRef.current, currentStep);
        }
      }, 100);
    }
  }, [isPlaying, isPaused, currentStep, startSpeaking]);

  // Changer le mode de lecture
  const changeReadingMode = useCallback((mode: 'step' | 'full') => {
    setReadingMode(mode);
    if ((isPlaying || isPaused) && currentMealRef.current) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setTimeout(() => {
        if (currentMealRef.current) {
          startSpeaking(currentMealRef.current, mode === 'full' ? 0 : currentStep);
        }
      }, 100);
    }
  }, [isPlaying, isPaused, currentStep, startSpeaking]);

  // Navigation
  const nextStep = useCallback((meal: Meal | null) => {
    if (!meal || currentStep >= meal.steps.length - 1) return;
    
    speechSynthesis.cancel();
    setCurrentStep(prev => prev + 1);
    setIsPlaying(false);
    setIsPaused(false);
    
    setTimeout(() => {
      if (meal) {
        startSpeaking(meal, currentStep + 1);
      }
    }, 100);
  }, [currentStep, startSpeaking]);

  const prevStep = useCallback((meal: Meal | null) => {
    if (currentStep <= 0 || !meal) return;
    
    speechSynthesis.cancel();
    setCurrentStep(prev => prev - 1);
    setIsPlaying(false);
    setIsPaused(false);
    
    setTimeout(() => {
      if (meal) {
        startSpeaking(meal, currentStep - 1);
      }
    }, 100);
  }, [currentStep, startSpeaking]);

  return {
    isPlaying,
    isPaused,
    isLoading,
    currentStep,
    selectedVoice,
    readingMode,
    availableVoices,
    startSpeaking,
    speakRecipe,
    stopSpeaking,
    changeVoice,
    changeReadingMode,
    nextStep,
    prevStep,
    setCurrentStep,
  };
}

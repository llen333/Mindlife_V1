/**
 * useNutritionData Hook
 * Gestion du chargement, génération et sauvegarde des repas
 */

import { useState, useEffect, useCallback } from 'react';
import type { Meal, WeekInfo, MealTypeFilter, GenerateType } from '../types';
import { DAYS_SHORT, defaultImages, allMeals } from '../constants';

import { useStore } from '@/lib/store';

interface UseNutritionDataReturn {
  // State
  weekOffset: number;
  availableWeeks: WeekInfo[];
  isPreviewMode: boolean;
  previewMeals: Meal[];
  savedMeals: Meal[];
  mealTypeFilter: MealTypeFilter;
  isLoadingMeals: boolean;
  isSaving: boolean;
  displayedMeals: Meal[];
  
  // Actions
  setWeekOffset: (offset: number) => void;
  setMealTypeFilter: (filter: MealTypeFilter) => void;
  generateMeals: (type: GenerateType) => Promise<void>;
  saveMeals: () => Promise<void>;
  cancelPreview: () => void;
  getWeekDates: (offset: number) => Date[];
  getWeekLabel: (offset: number) => string;
}

export function useNutritionData(currentUserId: string): UseNutritionDataReturn {
  const { meals: savedMeals, setMeals } = useStore();

  // State
  const [weekOffset, setWeekOffset] = useState(0);
  const [availableWeeks, setAvailableWeeks] = useState<WeekInfo[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewMeals, setPreviewMeals] = useState<Meal[]>([]);
  const [mealTypeFilter, setMealTypeFilter] = useState<MealTypeFilter>('lunch');
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get week dates based on offset
  const getWeekDates = useCallback((offset: number): Date[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setDate(startOfWeek.getDate() + (offset * 7));
    
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  // Get week label
  const getWeekLabel = useCallback((offset: number): string => {
    const dates = getWeekDates(offset);
    const start = dates[0];
    const end = dates[6];
    const formatDate = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    
    if (offset === 0) return `Semaine actuelle (${formatDate(start)} - ${formatDate(end)})`;
    if (offset === -1) return `Semaine dernière (${formatDate(start)} - ${formatDate(end)})`;
    if (offset === 1) return `Semaine prochaine (${formatDate(start)} - ${formatDate(end)})`;
    return `Semaine du ${formatDate(start)} - ${formatDate(end)}`;
  }, [getWeekDates]);

  // Load meals for a week
  const loadMealsForWeek = useCallback(async (offset: number) => {
    setIsLoadingMeals(true);
    try {
      const dates = getWeekDates(offset);
      // Fetch a wider range (10 days before and 7 days after the week)
      // to keep historical stats (like 7-day history) and future look-ahead fully loaded
      const rangeStart = new Date(dates[0]);
      rangeStart.setDate(rangeStart.getDate() - 10);
      const rangeEnd = new Date(dates[6]);
      rangeEnd.setDate(rangeEnd.getDate() + 7);
      
      const res = await fetch(`/api/meals?userId=${currentUserId}&startDate=${rangeStart.toISOString()}&endDate=${rangeEnd.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.meals && data.meals.length > 0) {
          const apiMeals: Meal[] = data.meals.map((m: any) => ({
            id: m.id,
            day: new Date(m.date).toLocaleDateString('fr-FR', { weekday: 'long' }),
            dayShort: DAYS_SHORT[new Date(m.date).getDay()],
            title: m.name,
            description: m.description || '',
            image: m.imageUrl || defaultImages[0],
            protein: m.protein || 25,
            calories: m.calories || 500,
            type: m.type || 'lunch',
            ingredients: m.ingredients ? JSON.parse(m.ingredients) : [],
            steps: m.instructions ? m.instructions.split('\n').map((s: string, i: number) => ({ id: i, instruction: s, duration: 5 })) : [],
            tags: [],
            isToday: new Date(m.date).toDateString() === new Date().toDateString(),
            date: m.date,
          }));
          setMeals(apiMeals as any);
        } else {
          setMeals([]);
        }
      }
    } catch (error) {
      console.error('Error loading meals:', error);
      setMeals([]);
    } finally {
      setIsLoadingMeals(false);
    }
  }, [currentUserId, getWeekDates, setMeals]);

  // Load available weeks
  const loadAvailableWeeks = useCallback(async () => {
    try {
      const res = await fetch(`/api/meals/history?userId=${currentUserId}`);
      const weeks: WeekInfo[] = [{ offset: 0, label: getWeekLabel(0) }];
      
      if (res.ok) {
        const data = await res.json();
        if (data.weeks) {
          data.weeks.forEach((w: any) => {
            weeks.push({ offset: w.offset, label: getWeekLabel(w.offset) });
          });
        }
      }
      
      // Add nearby weeks
      for (let i = -4; i <= 2; i++) {
        if (i !== 0 && !weeks.find(w => w.offset === i)) {
          weeks.push({ offset: i, label: getWeekLabel(i) });
        }
      }
      weeks.sort((a, b) => b.offset - a.offset);
      setAvailableWeeks(weeks);
    } catch {
      setAvailableWeeks([
        { offset: 0, label: getWeekLabel(0) },
        { offset: -1, label: getWeekLabel(-1) },
        { offset: -2, label: getWeekLabel(-2) },
      ]);
    }
  }, [currentUserId, getWeekLabel]);

  // Generate meals with AI
  const generateMeals = useCallback(async (type: GenerateType) => {
    console.log('🍳 generateMeals called with type:', type, 'currentUserId:', currentUserId);
    setIsGenerating(true);
    try {
      const dates = getWeekDates(weekOffset);
      const startDate = dates[0].toISOString();
      console.log('🍳 Generating meals for week starting:', startDate);
      
      const response = await fetch('/api/meals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          mealType: type,
          days: 7,
          startDate,
          save: false,
        })
      });

      console.log('🍳 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🍳 Received data:', data.meals?.length, 'meals');
        
        const mappedMeals: Meal[] = (data.meals || []).map((m: any) => ({
          id: m.id,
          day: m.dayName || new Date(m.date).toLocaleDateString('fr-FR', { weekday: 'long' }),
          dayShort: m.dayShort || DAYS_SHORT[new Date(m.date).getDay()],
          title: m.name || m.title,
          description: m.description || '',
          image: m.imageUrl || m.image || defaultImages[Math.floor(Math.random() * defaultImages.length)],
          protein: m.protein || 25,
          calories: m.calories || 500,
          type: m.type,
          ingredients: typeof m.ingredients === 'string' ? JSON.parse(m.ingredients) : (m.ingredients || []),
          steps: m.instructions ? m.instructions.split('\n').map((s: string, i: number) => ({ id: i, instruction: s, duration: 5 })) : (m.steps || []),
          tags: [],
          isToday: new Date(m.date).toDateString() === new Date().toDateString(),
          date: m.date,
        }));
        
        console.log('🍳 Mapped meals:', mappedMeals.length, 'setting preview mode');
        setPreviewMeals(mappedMeals);
        setIsPreviewMode(true);
        
        // Update filter after meals are loaded
        if (type === 'both') {
          setMealTypeFilter('all');
        } else {
          setMealTypeFilter(type);
        }
        console.log('🍳 Filter set to:', type === 'both' ? 'all' : type);
      } else {
        console.error('🍳 Generate response not ok:', response.status);
      }
    } catch (error) {
      console.error('🍳 Error generating meals:', error);
    } finally {
      setIsGenerating(false);
      console.log('🍳 Generation complete, isGenerating set to false');
    }
  }, [currentUserId, getWeekDates, weekOffset]);

  // Save generated meals
  const saveMeals = useCallback(async () => {
    if (previewMeals.length === 0) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/meals/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          meals: previewMeals
        })
      });

      if (response.ok) {
        setIsPreviewMode(false);
        setPreviewMeals([]);
        setWeekOffset(0);
        await loadMealsForWeek(0);
      }
    } catch (error) {
      console.error('Error saving meals:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentUserId, previewMeals, loadMealsForWeek]);

  // Cancel preview
  const cancelPreview = useCallback(() => {
    setIsPreviewMode(false);
    setPreviewMeals([]);
  }, []);

  // Load meals on mount and when week changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!isPreviewMode) {
      loadMealsForWeek(weekOffset);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [weekOffset, isPreviewMode, loadMealsForWeek]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    loadAvailableWeeks();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [loadAvailableWeeks]);

  // Computed displayed meals with filtering
  const displayedMeals = (() => {
    let meals: any[] = [];
    const dates = getWeekDates(weekOffset);
    
    if (isPreviewMode && previewMeals.length > 0) {
      meals = previewMeals;
    } else if (savedMeals.length > 0) {
      const weekStart = new Date(dates[0]);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(dates[6]);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekMeals = savedMeals.filter(m => {
        const d = new Date(m.date);
        return d >= weekStart && d <= weekEnd;
      });
      
      meals = weekMeals.length > 0 ? weekMeals : allMeals;
    } else {
      meals = allMeals;
    }
    
    if (mealTypeFilter === 'all') {
      return meals;
    }
    
    return meals.filter(meal => meal.type === mealTypeFilter);
  })();

  return {
    weekOffset,
    availableWeeks,
    isPreviewMode,
    previewMeals,
    savedMeals,
    mealTypeFilter,
    isLoadingMeals,
    isSaving,
    displayedMeals,
    setWeekOffset,
    setMealTypeFilter,
    generateMeals,
    saveMeals,
    cancelPreview,
    getWeekDates,
    getWeekLabel,
  };
}

/**
 * useNutritionModals Hook
 * Gestion des états des modales (Recipe Modal et Audio Drawer)
 */

import { useState, useCallback } from 'react';
import type { Meal, Ingredient } from '../types';

interface UseNutritionModalsReturn {
  // Recipe Modal
  selectedMeal: Meal | null;
  isRecipeModalOpen: boolean;
  openRecipeModal: (meal: Meal) => void;
  closeRecipeModal: () => void;
  
  // Audio Drawer
  isAudioDrawerOpen: boolean;
  openAudioDrawer: (meal: Meal) => void;
  closeAudioDrawer: () => void;
  
  // Ingredients state
  ingredients: Ingredient[];
  toggleIngredient: (id: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function useNutritionModals(): UseNutritionModalsReturn {
  // Recipe Modal state
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  
  // Audio Drawer state
  const [isAudioDrawerOpen, setIsAudioDrawerOpen] = useState(false);
  
  // Ingredients state
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Open recipe modal
  const openRecipeModal = useCallback((meal: Meal) => {
    setSelectedMeal(meal);
    setIngredients(meal.ingredients.map((ing, i) => ({ 
      ...ing, 
      id: ing.id || `ing-${i}`, 
      checked: false 
    })));
    setCurrentStep(0);
    setIsRecipeModalOpen(true);
    setIsAudioDrawerOpen(false);
  }, []);

  // Close recipe modal
  const closeRecipeModal = useCallback(() => {
    setIsRecipeModalOpen(false);
  }, []);

  // Open audio drawer with auto-play preparation
  const openAudioDrawer = useCallback((meal: Meal) => {
    // Stop any existing speech
    speechSynthesis.cancel();
    
    setSelectedMeal(meal);
    setIngredients(meal.ingredients.map((ing, i) => ({ 
      ...ing, 
      id: ing.id || `ing-${i}`, 
      checked: false 
    })));
    setCurrentStep(0);
    setIsAudioDrawerOpen(true);
    setIsRecipeModalOpen(false);
  }, []);

  // Close audio drawer
  const closeAudioDrawer = useCallback(() => {
    speechSynthesis.cancel();
    setIsAudioDrawerOpen(false);
  }, []);

  // Toggle ingredient checked state
  const toggleIngredient = useCallback((id: string) => {
    setIngredients(prev => 
      prev.map(ing => 
        ing.id === id ? { ...ing, checked: !ing.checked } : ing
      )
    );
  }, []);

  return {
    selectedMeal,
    isRecipeModalOpen,
    openRecipeModal,
    closeRecipeModal,
    isAudioDrawerOpen,
    openAudioDrawer,
    closeAudioDrawer,
    ingredients,
    toggleIngredient,
    currentStep,
    setCurrentStep,
  };
}

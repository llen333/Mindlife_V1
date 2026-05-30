'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Utensils as UtensilsIcon } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useUserProfile } from '@/lib/hooks';
import MindLifeHeader from '../MindLifeHeader';

// Nutrition imports
import { useNutritionData, useNutritionModals, useTTS } from './hooks';
import { MealGrid, NutritionStats, NutritionLogistics, NutritionInspirations, DailyTracking } from './components';
import { RecipeModal, AudioDrawer, ManualMealModal } from './modals';
import { periodOptions, weeklyMeals, defaultShoppingList, defaultBudget, defaultPrepTime } from './constants';

// Global CSS styles for nutrition page
const globalStyles = `
  .glass-panel {
    background: rgba(10, 20, 15, 0.65);
    backdrop-filter: blur(40px);
    border: 1px solid rgba(17, 212, 115, 0.2);
    box-shadow: 0 15px 50px -15px rgba(0, 0, 0, 0.8);
  }
  .bg-gradient-mesh {
    background-image: 
      radial-gradient(at 0% 0%, rgba(17, 212, 115, 0.1) 0, transparent 40%),
      radial-gradient(at 100% 100%, rgba(17, 212, 115, 0.08) 0, transparent 40%),
      radial-gradient(at 50% 50%, rgba(10, 15, 12, 1) 0, transparent 100%);
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(17, 212, 115, 0.3);
    border-radius: 10px;
  }
`;

export default function NutritionPage() {
  const { 
    currentUserId, 
    meals, 
    nutritionProfile, 
    loadNutritionData, 
    addMeal, 
    deleteMeal 
  } = useStore();
  const { computed: computedMetrics } = useUserProfile();
  
  // Manual meal form modal state
  const [isManualMealOpen, setIsManualMealOpen] = useState(false);
  
  // Load nutrition data (profile + meals) on mount and when userId changes
  useEffect(() => {
    loadNutritionData();
  }, [currentUserId, loadNutritionData]);
  
  // Safe computed values with defaults based on target profile in Zustand or userProfile
  const computed = {
    targetCalories: nutritionProfile?.targetCalories || computedMetrics?.targetCalories || 2400,
    protein: nutritionProfile?.protein || computedMetrics?.protein || 180,
    carbs: nutritionProfile?.carbs || computedMetrics?.carbs || 240,
    fat: nutritionProfile?.fat || computedMetrics?.fat || 75,
  };
  
  // Period state
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  // Refs for animations
  const statsCardsRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const logisticsRef = useRef<HTMLDivElement>(null);
  const inspirationsRef = useRef<HTMLDivElement>(null);
  const recipeModalRef = useRef<HTMLDivElement>(null);
  const recipeModalContentRef = useRef<HTMLDivElement>(null);
  const audioDrawerRef = useRef<HTMLDivElement>(null);
  const previewBannerRef = useRef<HTMLDivElement>(null);
  const soundwaveRef = useRef<HTMLDivElement>(null);

  // Hooks
  const nutritionData = useNutritionData(currentUserId || 'mindlife-user');
  const modals = useNutritionModals();
  const tts = useTTS(modals.selectedMeal, modals.currentStep, modals.setCurrentStep);

  // Macros from computed profile
  const macros = {
    calories: computed.targetCalories,
    protein: computed.protein,
    carbs: computed.carbs,
    fat: computed.fat,
  };

  // Period helpers
  const getPeriodMultiplier = useCallback(() => {
    const period = periodOptions.find(p => p.id === selectedPeriod);
    return period?.multiplier || 7;
  }, [selectedPeriod]);

  const getPeriodLabel = useCallback(() => {
    const period = periodOptions.find(p => p.id === selectedPeriod);
    return period?.label || 'Semaine';
  }, [selectedPeriod]);

  // Calculate total ingredients price
  const calculateTotalIngredients = useCallback(() => {
    const multiplier = getPeriodMultiplier();
    const baseTotal = weeklyMeals.reduce((sum, meal) => {
      return sum + meal.ingredients.reduce((ingSum, ing) => ingSum + (ing.price || 0), 0);
    }, 0);
    return (baseTotal * multiplier / 7).toFixed(2);
  }, [getPeriodMultiplier]);

  // GSAP Animations
  useEffect(() => {
    if (statsCardsRef.current) {
      const cards = statsCardsRef.current.querySelectorAll('.stat-card');
      gsap.fromTo(cards, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (progressBarRef.current) {
      gsap.fromTo(progressBarRef.current,
        { width: '0%' },
        { width: '65%', duration: 1, delay: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (logisticsRef.current) {
      const panels = logisticsRef.current.querySelectorAll('.logistics-panel');
      gsap.fromTo(panels,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (inspirationsRef.current) {
      const cards = inspirationsRef.current.querySelectorAll('.inspiration-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (modals.isRecipeModalOpen && recipeModalRef.current && recipeModalContentRef.current) {
      gsap.fromTo(recipeModalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(recipeModalContentRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [modals.isRecipeModalOpen]);

  useEffect(() => {
    if (modals.isAudioDrawerOpen && audioDrawerRef.current) {
      gsap.fromTo(audioDrawerRef.current, { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' });
    }
  }, [modals.isAudioDrawerOpen]);

  // Close Recipe Modal with animation
  const closeRecipeModal = useCallback(() => {
    if (recipeModalRef.current && recipeModalContentRef.current) {
      gsap.to(recipeModalContentRef.current, { scale: 0.9, opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(recipeModalRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => modals.closeRecipeModal() });
    } else {
      modals.closeRecipeModal();
    }
  }, [modals]);

  // Open audio drawer with auto-play
  const openAudioDrawer = useCallback((meal: typeof modals.selectedMeal) => {
    if (!meal) return;
    modals.openAudioDrawer(meal);
    setTimeout(() => {
      tts.startSpeaking(meal, 0);
    }, 300);
  }, [modals, tts]);

  // Soundwave animation
  useEffect(() => {
    if (soundwaveRef.current) {
      const bars = soundwaveRef.current.querySelectorAll('.soundwave-bar');
      if (tts.isPlaying) {
        bars.forEach((bar, i) => {
          bar.classList.add('animate-soundwave');
          (bar as HTMLElement).style.setProperty('--bar-delay', `${i * 0.1}s`);
          (bar as HTMLElement).style.setProperty('--bar-height', `${[40, 70, 100, 60, 85, 45, 90, 55][i]}%`);
        });
      } else {
        bars.forEach((bar) => {
          bar.classList.remove('animate-soundwave');
          (bar as HTMLElement).style.height = '30%';
        });
      }
    }
  }, [tts.isPlaying]);

  return (
    <div className="min-h-screen bg-[#050706] text-white overflow-x-hidden pl-[70px] pt-16">
      <style jsx global>{globalStyles}</style>
      
      {/* Background gradient mesh */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <MindLifeHeader
          title="Alimentation"
          subtitle="Logistique Drive & Cuisine Audio"
          icon={UtensilsIcon}
          theme="emerald"
          showBackButton={true}
        />

        <div className="p-6 pb-32 max-w-7xl mx-auto">
          {/* Stats Section */}
          <NutritionStats
            statsCardsRef={statsCardsRef}
            progressBarRef={progressBarRef}
            budget={defaultBudget}
            prepTime={defaultPrepTime}
            macros={macros}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            getPeriodMultiplier={getPeriodMultiplier}
            getPeriodLabel={getPeriodLabel}
          />

          {/* Suivi Quotidien & Historique */}
          <DailyTracking
            meals={meals}
            nutritionProfile={nutritionProfile}
            onOpenManualEntry={() => setIsManualMealOpen(true)}
            onDeleteMeal={deleteMeal}
          />

          {/* Weekly Planning */}
          <MealGrid
            meals={nutritionData.displayedMeals}
            isPreviewMode={nutritionData.isPreviewMode}
            previewMeals={nutritionData.previewMeals}
            isGenerating={false}
            isSaving={nutritionData.isSaving}
            mealTypeFilter={nutritionData.mealTypeFilter}
            weekOffset={nutritionData.weekOffset}
            availableWeeks={nutritionData.availableWeeks}
            onOpenRecipe={modals.openRecipeModal}
            onOpenAudio={openAudioDrawer}
            onGenerateMeals={nutritionData.generateMeals}
            onSaveMeals={nutritionData.saveMeals}
            onCancelPreview={nutritionData.cancelPreview}
            onSetWeekOffset={nutritionData.setWeekOffset}
            onSetMealTypeFilter={nutritionData.setMealTypeFilter}
            previewBannerRef={previewBannerRef}
            onDeleteMeal={deleteMeal}
          />

          {/* Logistics Section */}
          <NutritionLogistics
            logisticsRef={logisticsRef}
            shoppingList={defaultShoppingList}
            getPeriodMultiplier={getPeriodMultiplier}
            getPeriodLabel={getPeriodLabel}
            calculateTotalIngredients={calculateTotalIngredients}
          />

          {/* Inspirations Section */}
          <NutritionInspirations inspirationsRef={inspirationsRef} />
        </div>
      </div>

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={modals.isRecipeModalOpen}
        meal={modals.selectedMeal}
        ingredients={modals.ingredients}
        currentStep={modals.currentStep}
        isPlaying={tts.isPlaying}
        isPaused={tts.isPaused}
        isTTSLoding={tts.isTTSLoding}
        selectedVoice={tts.selectedVoice}
        onClose={closeRecipeModal}
        onToggleIngredient={modals.toggleIngredient}
        onStartSpeaking={tts.startSpeaking}
        onChangeVoice={tts.changeVoice}
        onSpeakRecipe={tts.speakRecipe}
        recipeModalRef={recipeModalRef}
        recipeModalContentRef={recipeModalContentRef}
      />

      {/* Audio Drawer */}
      <AudioDrawer
        isOpen={modals.isAudioDrawerOpen}
        meal={modals.selectedMeal}
        ingredients={modals.ingredients}
        currentStep={modals.currentStep}
        isPlaying={tts.isPlaying}
        isLoading={false}
        selectedVoice={tts.selectedVoice}
        readingMode={tts.readingMode}
        onClose={modals.closeAudioDrawer}
        onToggleIngredient={modals.toggleIngredient}
        onSpeakRecipe={tts.speakRecipe}
        onChangeVoice={tts.changeVoice}
        onChangeReadingMode={tts.changeReadingMode}
        onNextStep={tts.nextStep}
        onPrevStep={tts.prevStep}
        audioDrawerRef={audioDrawerRef}
        soundwaveRef={soundwaveRef}
      />

      {/* Popup de saisie manuelle de repas */}
      <ManualMealModal
        isOpen={isManualMealOpen}
        onClose={() => setIsManualMealOpen(false)}
        onSave={async (mealData) => {
          await addMeal({
            name: mealData.name,
            type: mealData.type,
            date: new Date(mealData.date),
            calories: mealData.calories,
            protein: mealData.protein,
            carbs: mealData.carbs,
            fat: mealData.fat,
            servings: 1,
            description: 'Saisie manuelle',
            imageUrl: '',
            ingredients: [],
            instructions: '',
          });
        }}
      />
    </div>
  );
}

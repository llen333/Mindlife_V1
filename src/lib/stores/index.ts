// ============================================================
// MINDLIFE STORES - Index principal
// ============================================================
// Ce fichier réexporte tous les stores pour la compatibilité ascendante
// et fournit un hook useStore() similaire à l'ancien pour faciliter la migration
// ============================================================

// Types
export * from './types';

// Mappers
export * from './mappers';

// Stores individuels
export { useUserStore, useCurrentUserId, useUsers, useUserProfile, useDataLoaded } from './userStore';
export { useSettingsStore, useLanguage, useTheme, useTranslate, useSidebarOpen, useIsAssistantOpen, useIsLoading, useIsRecording } from './settingsStore';
export { useNavigationStore, useActivePanel, useSelectedCategory } from './navigationStore';
export { useCategoriesStore, useCategories, useCategoryInfo } from './categoriesStore';
export { useTasksStore, useTasks, useTaskById, useTasksByStatus, useTasksStats } from './tasksStore';
export { useEventsStore, useEvents, useEventById, useEventsByDate, useEventsByDateRange } from './eventsStore';
export { useGoalsStore, useGoals, useGoalById, useGoalsByStatus, useGoalsStats } from './goalsStore';
export { useNotesStore, useNotes, usePinnedNotes, useNoteById } from './notesStore';
export { useHabitsStore, useHabits, useActiveHabits, useHabitById } from './habitsStore';
export { useJournalStore, useJournalEntries, useJournalEntryByDate } from './journalStore';
export { useChatStore, useChatMessages } from './chatStore';
export { useVoiceMemosStore, useVoiceMemos } from './voiceMemosStore';
export { useSleepStore, useSleepEntries } from './sleepStore';
export { useNutritionStore, useMeals, useNutritionProfile } from './nutritionStore';

// Hooks composites
export { useTaskWithEvent } from '../hooks/domain/useTaskWithEvent';
export { useDataLoader } from '../hooks/domain/useDataLoader';

// ============================================================
// COMPATIBILITÉ ASCENDANTE - useStore() optimisé
// ============================================================
// Ce hook permet aux anciens composants de fonctionner sans modification
// IL UTILISE MAINTENANT LES SÉLECTEURS OPTIMISÉS DIRECTEMENT
// ============================================================

import { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore, useCurrentUserId, useUsers, useUserProfile, useDataLoaded } from './userStore';
import { useSettingsStore, useLanguage, useTheme, useSidebarOpen, useIsLoading } from './settingsStore';
import { useNavigationStore, useActivePanel, useSelectedCategory } from './navigationStore';
import { useCategoriesStore, useCategories } from './categoriesStore';
import { useTasksStore, useTasks } from './tasksStore';
import { useEventsStore, useEvents } from './eventsStore';
import { useGoalsStore, useGoals } from './goalsStore';
import { useNotesStore, useNotes } from './notesStore';
import { useHabitsStore, useHabits } from './habitsStore';
import { useJournalStore, useJournalEntries } from './journalStore';
import { useChatStore, useChatMessages } from './chatStore';
import { useVoiceMemosStore, useVoiceMemos } from './voiceMemosStore';
import { useSleepStore } from './sleepStore';
import { useNutritionStore } from './nutritionStore';
import { Task, Goal, Note, Event, Habit, JournalEntry, ChatMessage, VoiceMemo, Category, SleepEntry, Meal, NutritionProfile } from './types';
import {
  mapDBTaskToStore,
  mapDBEventToStore,
  mapDBGoalToStore,
  mapDBNoteToStore,
  mapDBHabitToStore,
  mapDBJournalToStore,
  mapDBCategoryToStore,
  mapDBSleepToStore,
  mapDBMealToStore,
  mapDBNutritionProfileToStore,
} from './mappers';

// Type pour l'état combiné complet
type CombinedState = {
  // User
  currentUserId: string;
  users: any[];
  userProfile: any;
  dataLoaded: boolean;
  setCurrentUserId: (id: string) => void;
  setUsers: (users: any[]) => void;
  setUserProfile: (profile: any) => void;
  loadUserProfile: () => Promise<void>;
  saveUserProfile: (profile: any) => Promise<void>;
  loadUsers: () => Promise<void>;
  createNewUser: (name: string) => Promise<string | null>;
  deleteUser: (userId: string) => Promise<boolean>;

  // Settings
  language: string;
  theme: string;
  sidebarOpen: boolean;
  isAssistantOpen: boolean;
  isLoading: boolean;
  isRecording: boolean;
  setLanguage: (lang: string) => void;
  translate: (key: string) => string;
  setTheme: (theme: string) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setIsAssistantOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsRecording: (recording: boolean) => void;

  // Navigation
  activePanel: string;
  selectedCategory: string;
  setActivePanel: (panel: string) => void;
  setSelectedCategory: (category: string) => void;

  // Categories
  categories: Category[];
  loadCategories: (userId?: string) => Promise<void>;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  loadTasks: (userId?: string) => Promise<void>;
  addTask: (task: Task) => Promise<Task | null>;
  addTaskWithEvent: (task: Task, eventData?: { startTime: string; endTime: string; color: string }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Events
  events: Event[];
  setEvents: (events: Event[]) => void;
  loadEvents: (userId?: string) => Promise<void>;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<Event | null>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Goals
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  loadGoals: (userId?: string) => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Notes
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  loadNotes: (userId?: string) => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Habits
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  loadHabits: (userId?: string) => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitComplete: (id: string, date: string) => Promise<void>;

  // Journal
  journalEntries: JournalEntry[];
  setJournalEntries: (entries: JournalEntry[]) => void;
  loadJournal: (userId?: string) => Promise<void>;
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // Voice Memos
  voiceMemos: VoiceMemo[];
  addVoiceMemo: (memo: VoiceMemo) => void;
  updateVoiceMemo: (id: string, updates: Partial<VoiceMemo>) => void;
  deleteVoiceMemo: (id: string) => void;

  // Sleep
  sleepEntries: SleepEntry[];
  setSleepEntries: (entries: SleepEntry[]) => void;
  loadSleepEntries: () => Promise<void>;
  addSleepEntry: (entry: Omit<SleepEntry, 'id' | 'userId' | 'createdAt' | 'duration'>) => Promise<void>;
  deleteSleepEntry: (id: string) => Promise<void>;

  // Nutrition
  meals: Meal[];
  nutritionProfile: NutritionProfile | null;
  setMeals: (meals: Meal[]) => void;
  setNutritionProfile: (profile: NutritionProfile | null) => void;
  loadNutritionData: () => Promise<void>;
  addMeal: (meal: Omit<Meal, 'id' | 'userId' | 'createdAt' | 'isGenerated' | 'isFavorite'>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  updateNutritionProfile: (profile: Partial<NutritionProfile>) => Promise<void>;

  // Data loading
  loadAllData: () => Promise<void>;
};

// ============================================================
// HOOK useStore OPTIMISÉ
// ============================================================
// Ce hook utilise TOUJOURS les stores optimisés individuellement
// Pas d'appel conditionnel - React require que tous les hooks soient appelés
// dans le même ordre à chaque render
// ============================================================

export function useStore<T = CombinedState>(selector?: (state: CombinedState) => T): T {
  // Utiliser les hooks optimisés individuellement - TOUJOURS
  const currentUserId = useCurrentUserId();
  const users = useUsers();
  const userProfile = useUserProfile();
  const dataLoaded = useDataLoaded();
  
  const language = useLanguage();
  const theme = useTheme();
  const sidebarOpen = useSidebarOpen();
  const isAssistantOpen = useSettingsStore((s) => s.isAssistantOpen);
  const isLoading = useIsLoading();
  const isRecording = useSettingsStore((s) => s.isRecording);
  
  const activePanel = useActivePanel();
  const selectedCategory = useSelectedCategory();
  
  const categories = useCategories();
  const tasks = useTasks();
  const events = useEvents();
  const goals = useGoals();
  const notes = useNotes();
  const habits = useHabits();
  const journalEntries = useJournalEntries();
  const chatMessages = useChatMessages();
  const voiceMemos = useVoiceMemos();
  
  // Actions - récupérées avec useShallow pour éviter les boucles infinies
  const userActions = useUserStore(useShallow((s) => ({
    setCurrentUserId: s.setCurrentUserId,
    setUsers: s.setUsers,
    setUserProfile: s.setUserProfile,
    loadUserProfile: s.loadUserProfile,
    saveUserProfile: s.saveUserProfile,
    loadUsers: s.loadUsers,
    createNewUser: s.createNewUser,
    deleteUser: s.deleteUser,
  })));
  
  const settingsActions = useSettingsStore(useShallow((s) => ({
    setLanguage: s.setLanguage,
    translate: s.translate,
    setTheme: s.setTheme,
    setSidebarOpen: s.setSidebarOpen,
    toggleSidebar: s.toggleSidebar,
    setIsAssistantOpen: s.setIsAssistantOpen,
    setIsLoading: s.setIsLoading,
    setIsRecording: s.setIsRecording,
  })));
  
  const navigationActions = useNavigationStore(useShallow((s) => ({
    setActivePanel: s.setActivePanel,
    setSelectedCategory: s.setSelectedCategory,
  })));
  
  const categoriesActions = useCategoriesStore(useShallow((s) => ({
    loadCategories: s.loadCategories,
    setCategories: s.setCategories,
  })));
  
  // Wrappers pour tasks avec userId automatique
  const addTask = useCallback(async (task: Task) => {
    return await useTasksStore.getState().addTask(task, currentUserId);
  }, [currentUserId]);
  
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    await useTasksStore.getState().updateTask(id, updates, currentUserId);
  }, [currentUserId]);
  
  const deleteTask = useCallback(async (id: string) => {
    await useTasksStore.getState().deleteTask(id, currentUserId);
  }, [currentUserId]);
  
  const loadTasks = useCallback(async () => {
    await useTasksStore.getState().loadTasks(currentUserId);
  }, [currentUserId]);
  
  // Wrappers pour events avec userId automatique
  const addEvent = useCallback(async (event: Omit<Event, 'id' | 'createdAt'>) => {
    return await useEventsStore.getState().addEvent(event, currentUserId);
  }, [currentUserId]);
  
  const updateEvent = useCallback(async (id: string, updates: Partial<Event>) => {
    await useEventsStore.getState().updateEvent(id, updates, currentUserId);
  }, [currentUserId]);
  
  const deleteEvent = useCallback(async (id: string) => {
    await useEventsStore.getState().deleteEvent(id, currentUserId);
  }, [currentUserId]);
  
  const loadEvents = useCallback(async () => {
    await useEventsStore.getState().loadEvents(currentUserId);
  }, [currentUserId]);
  
  // Wrappers pour goals avec userId automatique
  const addGoal = useCallback(async (goal: Goal) => {
    await useGoalsStore.getState().addGoal(goal, currentUserId);
  }, [currentUserId]);
  
  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    await useGoalsStore.getState().updateGoal(id, updates, currentUserId);
  }, [currentUserId]);
  
  const deleteGoal = useCallback(async (id: string) => {
    await useGoalsStore.getState().deleteGoal(id, currentUserId);
  }, [currentUserId]);
  
  const loadGoals = useCallback(async () => {
    await useGoalsStore.getState().loadGoals(currentUserId);
  }, [currentUserId]);
  
  // Wrappers pour notes avec userId automatique
  const addNote = useCallback(async (note: Note) => {
    await useNotesStore.getState().addNote(note, currentUserId);
  }, [currentUserId]);
  
  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    await useNotesStore.getState().updateNote(id, updates, currentUserId);
  }, [currentUserId]);
  
  const deleteNote = useCallback(async (id: string) => {
    await useNotesStore.getState().deleteNote(id, currentUserId);
  }, [currentUserId]);
  
  const loadNotes = useCallback(async () => {
    await useNotesStore.getState().loadNotes(currentUserId);
  }, [currentUserId]);
  
  // Wrappers pour habits avec userId automatique
  const addHabit = useCallback(async (habit: Habit) => {
    return await useHabitsStore.getState().addHabit(habit, currentUserId);
  }, [currentUserId]);
  
  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    await useHabitsStore.getState().updateHabit(id, updates, currentUserId);
  }, [currentUserId]);
  
  const deleteHabit = useCallback(async (id: string) => {
    await useHabitsStore.getState().deleteHabit(id, currentUserId);
  }, [currentUserId]);
  
  const loadHabits = useCallback(async () => {
    await useHabitsStore.getState().loadHabits(currentUserId);
  }, [currentUserId]);
  
  const toggleHabitComplete = useCallback(async (id: string, date: string) => {
    await useHabitsStore.getState().toggleHabitComplete(id, date);
  }, []);
  
  // Wrappers pour journal avec userId automatique
  const addJournalEntry = useCallback(async (entry: JournalEntry) => {
    return await useJournalStore.getState().addJournalEntry(entry);
  }, []);
  
  const updateJournalEntry = useCallback(async (id: string, updates: Partial<JournalEntry>) => {
    await useJournalStore.getState().updateJournalEntry(id, updates);
  }, []);
  
  const deleteJournalEntry = useCallback(async (id: string) => {
    await useJournalStore.getState().deleteJournalEntry(id);
  }, []);
  
  const loadJournal = useCallback(async () => {
    await useJournalStore.getState().loadJournal(currentUserId);
  }, [currentUserId]);
  
  // Sleep state and actions
  const sleepEntries = useSleepStore((state) => state.sleepEntries);
  
  const loadSleepEntries = useCallback(async () => {
    await useSleepStore.getState().loadSleepEntries(currentUserId);
  }, [currentUserId]);
  
  const addSleepEntry = useCallback(async (entry: Omit<SleepEntry, 'id' | 'userId' | 'createdAt' | 'duration'>) => {
    await useSleepStore.getState().addSleepEntry(entry, currentUserId);
  }, [currentUserId]);
  
  const deleteSleepEntry = useCallback(async (id: string) => {
    await useSleepStore.getState().deleteSleepEntry(id, currentUserId);
  }, [currentUserId]);

  // Nutrition state and actions
  const meals = useNutritionStore((state) => state.meals);
  const nutritionProfile = useNutritionStore((state) => state.nutritionProfile);
  const setMeals = useNutritionStore((state) => state.setMeals);
  const setNutritionProfile = useNutritionStore((state) => state.setNutritionProfile);

  const loadNutritionData = useCallback(async () => {
    await useNutritionStore.getState().loadNutritionData(currentUserId);
  }, [currentUserId]);

  const addMeal = useCallback(async (meal: Omit<Meal, 'id' | 'userId' | 'createdAt' | 'isGenerated' | 'isFavorite'>) => {
    await useNutritionStore.getState().addMeal(meal, currentUserId);
  }, [currentUserId]);

  const deleteMeal = useCallback(async (id: string) => {
    await useNutritionStore.getState().deleteMeal(id, currentUserId);
  }, [currentUserId]);

  const updateNutritionProfile = useCallback(async (profile: Partial<NutritionProfile>) => {
    await useNutritionStore.getState().updateNutritionProfile(profile, currentUserId);
  }, [currentUserId]);
  
  const chatActions = useChatStore(useShallow((s) => ({
    addChatMessage: s.addChatMessage,
    clearChat: s.clearChat,
  })));
  
  const voiceMemosActions = useVoiceMemosStore(useShallow((s) => ({
    addVoiceMemo: s.addVoiceMemo,
    updateVoiceMemo: s.updateVoiceMemo,
    deleteVoiceMemo: s.deleteVoiceMemo,
  })));
  
  // Fonction composite addTaskWithEvent - mémorisée avec useCallback
  // IMPORTANT: Cette fonction utilise l'API tasks avec addToCalendar: true
  // L'API crée l'événement automatiquement et le lie à la tâche (eventId)
  // On recharge simplement les données depuis la DB pour éviter les doublons
  const addTaskWithEvent = useCallback(async (task: Task, eventData?: { startTime: string; endTime: string; color: string }) => {
    const userId = currentUserId;
    
    try {
      // 1. Créer la tâche avec addToCalendar: true
      // L'API créera automatiquement l'événement lié et mettra à jour task.eventId
      const taskRes = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          userId,
          addToCalendar: true,
          time: eventData?.startTime || task.time || '09:00',
          chapters: task.chapters ? JSON.stringify(task.chapters) : undefined,
        }),
      });
      const taskData = await taskRes.json();
      
      if (!taskData.task) return;
      
      // 2. Recharger les données depuis la DB pour éviter les incohérences
      // L'API a créé la tâche avec eventId et l'événement associé
      // On les récupère directement depuis la DB
      const [tasksReloadRes, eventsReloadRes] = await Promise.all([
        fetch(`/api/tasks?userId=${userId}`),
        fetch(`/api/events?userId=${userId}`),
      ]);
      
      const [tasksReloadData, eventsReloadData] = await Promise.all([
        tasksReloadRes.json(),
        eventsReloadRes.json(),
      ]);
      
      // 3. Mettre à jour les stores avec les données fraîches de la DB
      useTasksStore.setState({ tasks: (tasksReloadData.tasks || []).map(mapDBTaskToStore) });
      useEventsStore.setState({ events: (eventsReloadData.events || []).map(mapDBEventToStore) });
    } catch (error) {
      console.error('Error adding task with event:', error);
    }
  }, [currentUserId]);
  
  // Fonction loadAllData optimisée - mémorisée avec useCallback
  const loadAllData = useCallback(async () => {
    if (dataLoaded) return;
    
    useSettingsStore.getState().setIsLoading(true);
    try {
      const userId = currentUserId;
      
      const [tasksRes, goalsRes, notesRes, eventsRes, habitsRes, journalRes, categoriesRes, usersRes, profileRes, sleepRes, mealsRes, nutritionRes] = await Promise.all([
        fetch(`/api/tasks?userId=${userId}`),
        fetch(`/api/goals?userId=${userId}`),
        fetch(`/api/notes?userId=${userId}`),
        fetch(`/api/events?userId=${userId}`),
        fetch(`/api/habits?userId=${userId}`),
        fetch(`/api/journal?userId=${userId}`),
        fetch(`/api/categories?userId=${userId}`),
        fetch(`/api/users?all=true&userId=${userId}`),
        fetch(`/api/users?userId=${userId}`),
        fetch(`/api/sleep?userId=${userId}`),
        fetch(`/api/meals?userId=${userId}`),
        fetch(`/api/nutrition-profile?userId=${userId}`),
      ]);
      
      const [tasksData, goalsData, notesData, eventsData, habitsData, journalData, categoriesData, usersData, profileData, sleepData, mealsData, nutritionData] = await Promise.all([
        tasksRes.json(),
        goalsRes.json(),
        notesRes.json(),
        eventsRes.json(),
        habitsRes.json(),
        journalRes.json(),
        categoriesRes.json(),
        usersRes.json(),
        profileRes.json(),
        sleepRes.json(),
        mealsRes.json(),
        nutritionRes.json(),
      ]);
      
      // Mise à jour de chaque store en une seule fois
      useTasksStore.setState({ tasks: (tasksData.tasks || []).map(mapDBTaskToStore) });
      useGoalsStore.setState({ goals: (goalsData.goals || []).map(mapDBGoalToStore) });
      useNotesStore.setState({ notes: (notesData.notes || []).map(mapDBNoteToStore) });
      useEventsStore.setState({ events: (eventsData.events || []).map(mapDBEventToStore) });
      useHabitsStore.setState({ habits: (habitsData.habits || []).map((h: any) => mapDBHabitToStore(h, h.logs)) });
      useJournalStore.setState({ journalEntries: (journalData.entries || []).map(mapDBJournalToStore) });
      useCategoriesStore.setState({ categories: (categoriesData.categories || []).map(mapDBCategoryToStore) });
      useSleepStore.setState({ sleepEntries: (sleepData.sleepEntries || []).map(mapDBSleepToStore) });
      useNutritionStore.setState({
        meals: (mealsData.meals || []).map(mapDBMealToStore),
        nutritionProfile: nutritionData.profile ? mapDBNutritionProfileToStore(nutritionData.profile) : null
      });
      
      useUserStore.setState({ 
        users: usersData.users || [], 
        userProfile: profileData.user || null, 
        dataLoaded: true 
      });
      useSettingsStore.setState({ isLoading: false });
    } catch (error) {
      console.error('Error loading all data:', error);
      useSettingsStore.setState({ isLoading: false });
    }
  }, [currentUserId, dataLoaded]);
  
  // Construire l'état combiné - mémorisé avec useMemo pour éviter les re-renders
  const combinedState = useMemo<CombinedState>(() => ({
    // User
    currentUserId,
    users,
    userProfile,
    dataLoaded,
    ...userActions,
    
    // Settings
    language,
    theme,
    sidebarOpen,
    isAssistantOpen,
    isLoading,
    isRecording,
    ...settingsActions,
    
    // Navigation
    activePanel,
    selectedCategory,
    ...navigationActions,
    
    // Categories
    categories,
    ...categoriesActions,
    
    // Tasks
    tasks,
    setTasks: (tasks: Task[]) => useTasksStore.setState({ tasks }),
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    addTaskWithEvent,
    
    // Events
    events,
    setEvents: (events: Event[]) => useEventsStore.setState({ events }),
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    
    // Goals
    goals,
    setGoals: (goals: Goal[]) => useGoalsStore.setState({ goals }),
    loadGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    
    // Notes
    notes,
    setNotes: (notes: Note[]) => useNotesStore.setState({ notes }),
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
    
    // Habits
    habits,
    setHabits: (habits: Habit[]) => useHabitsStore.setState({ habits }),
    loadHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitComplete,
    
    // Journal
    journalEntries,
    setJournalEntries: (entries: JournalEntry[]) => useJournalStore.setState({ journalEntries: entries }),
    loadJournal,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    
    // Chat
    chatMessages,
    ...chatActions,
    
    // Voice Memos
    voiceMemos,
    ...voiceMemosActions,
    
    // Sleep
    sleepEntries,
    setSleepEntries: (entries: SleepEntry[]) => useSleepStore.setState({ sleepEntries: entries }),
    loadSleepEntries,
    addSleepEntry,
    deleteSleepEntry,

    // Nutrition
    meals,
    nutritionProfile,
    setMeals,
    setNutritionProfile,
    loadNutritionData,
    addMeal,
    deleteMeal,
    updateNutritionProfile,
    
    // Data loading
    loadAllData,
  }), [
    currentUserId, users, userProfile, dataLoaded, userActions,
    language, theme, sidebarOpen, isAssistantOpen, isLoading, isRecording, settingsActions,
    activePanel, selectedCategory, navigationActions,
    categories, categoriesActions,
    tasks, loadTasks, addTask, updateTask, deleteTask, addTaskWithEvent,
    events, loadEvents, addEvent, updateEvent, deleteEvent,
    goals, loadGoals, addGoal, updateGoal, deleteGoal,
    notes, loadNotes, addNote, updateNote, deleteNote,
    habits, loadHabits, addHabit, updateHabit, deleteHabit, toggleHabitComplete,
    journalEntries, loadJournal, addJournalEntry, updateJournalEntry, deleteJournalEntry,
    chatMessages, chatActions,
    voiceMemos, voiceMemosActions,
    sleepEntries, loadSleepEntries, addSleepEntry, deleteSleepEntry,
    meals, nutritionProfile, setMeals, setNutritionProfile, loadNutritionData, addMeal, deleteMeal, updateNutritionProfile,
    loadAllData,
  ]);
  
  // Appliquer le sélecteur si fourni
  return useMemo(() => 
    selector ? selector(combinedState) : (combinedState as T),
    [selector, combinedState]
  );
}

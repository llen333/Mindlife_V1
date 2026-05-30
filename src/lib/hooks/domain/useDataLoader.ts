// ============================================================
// USE DATA LOADER - Hook pour charger toutes les données
// ============================================================

import { useCallback } from 'react';
import { useUserStore, useCurrentUserId, useDataLoaded } from '../../stores/userStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useEventsStore } from '../../stores/eventsStore';
import { useGoalsStore } from '../../stores/goalsStore';
import { useNotesStore } from '../../stores/notesStore';
import { useHabitsStore } from '../../stores/habitsStore';
import { useJournalStore } from '../../stores/journalStore';
import { useCategoriesStore } from '../../stores/categoriesStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { mapDBTaskToStore, mapDBEventToStore, mapDBGoalToStore, mapDBNoteToStore, mapDBHabitToStore, mapDBJournalToStore, mapDBCategoryToStore } from '../../stores/mappers';

export function useDataLoader() {
  const userId = useCurrentUserId();
  const dataLoaded = useDataLoaded();
  const setUserProfile = useUserStore((s) => s.setUserProfile);
  const setUsers = useUserStore((s) => s.setUsers);
  const setDataLoaded = useUserStore((s) => s.setDataLoaded);
  const setIsLoading = useSettingsStore((s) => s.setIsLoading);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Charger TOUTES les données en parallèle
      const [tasksRes, goalsRes, notesRes, eventsRes, habitsRes, journalRes, categoriesRes, usersRes, profileRes] = await Promise.all([
        fetch(`/api/tasks?userId=${userId}`),
        fetch(`/api/goals?userId=${userId}`),
        fetch(`/api/notes?userId=${userId}`),
        fetch(`/api/events?userId=${userId}`),
        fetch(`/api/habits?userId=${userId}`),
        fetch(`/api/journal?userId=${userId}`),
        fetch(`/api/categories?userId=${userId}`),
        fetch(`/api/users?all=true&userId=${userId}`),
        fetch(`/api/users?userId=${userId}`),
      ]);

      const [tasksData, goalsData, notesData, eventsData, habitsData, journalData, categoriesData, usersData, profileData] = await Promise.all([
        tasksRes.json(),
        goalsRes.json(),
        notesRes.json(),
        eventsRes.json(),
        habitsRes.json(),
        journalRes.json(),
        categoriesRes.json(),
        usersRes.json(),
        profileRes.json(),
      ]);

      // MISE À JOUR D'ÉTAT
      useTasksStore.setState({ tasks: (tasksData.tasks || []).map(mapDBTaskToStore) });
      useGoalsStore.setState({ goals: (goalsData.goals || []).map(mapDBGoalToStore) });
      useNotesStore.setState({ notes: (notesData.notes || []).map(mapDBNoteToStore) });
      useEventsStore.setState({ events: (eventsData.events || []).map(mapDBEventToStore) });
      useHabitsStore.setState({ habits: (habitsData.habits || []).map((h: any) => mapDBHabitToStore(h, h.logs || [])) });
      useJournalStore.setState({ journalEntries: (journalData.entries || []).map(mapDBJournalToStore) });
      useCategoriesStore.setState({ categories: (categoriesData.categories || []).map(mapDBCategoryToStore) });

      setUsers(usersData.users || []);
      setUserProfile(profileData.user || null);
      setDataLoaded(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading all data:', error);
      setDataLoaded(true); // Même en cas d'erreur, on affiche l'interface
      setIsLoading(false);
    }
  }, [userId, setUsers, setUserProfile, setDataLoaded, setIsLoading]);

  return { loadAllData, dataLoaded };
}

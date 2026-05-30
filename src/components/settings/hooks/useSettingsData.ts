'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { useUsers, useCreateUser, useUpdateProfile, useDeleteUser } from '@/lib/hooks';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { activityMultipliers } from '@/lib/constants/settings-options';
import { ProfileFormData, CalculatedMetrics, initialFormData } from '../types';

export function useSettingsData() {
  const { currentUserId, setCurrentUserId, loadUserProfile } = useStore();
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'identite', 'corpus', 'nutrition', 'users', 'application', 'ai'
  ]);
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics>({
    imc: null,
    bmr: null,
    tdee: null,
  });

  // React Query hooks
  const { data: users = [], refetch: refetchUsers, isLoading: usersLoading, error: usersError } = useUsers();
  const { profile: currentUserProfile } = useUserProfile();
  const createUserMutation = useCreateUser();
  const updateProfileMutation = useUpdateProfile();
  const deleteUserMutation = useDeleteUser();

  // Forcer le rechargement des users au montage
  useEffect(() => {
    refetchUsers();
  }, [refetchUsers]);

  // Récupérer le rôle de l'utilisateur affiché
  const viewingUserRole = currentUserProfile?.role || 'member';

  // Vérifier si un admin existe dans la liste des users
  const hasAdminInUsers = users.length === 0 || (users || []).some((u: any) => u.role === 'admin');

  // Pour le sélecteur : visible si un admin existe dans la liste
  const isAdminConnected = hasAdminInUsers || currentUserId === 'mindlife-user';

  // L'admin regarde SON propre profil
  const isAdminViewingOwnProfile = currentUserId === 'mindlife-user';

  // Pour la compatibilité avec le code existant
  const isAdmin = isAdminViewingOwnProfile;

  // Pour la section API
  const canSeeApiSection = currentUserId === 'mindlife-user';

  // Safe JSON parse helper
  const safeParseArray = useCallback((value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }
    return [];
  }, []);

  // Charger le profil utilisateur
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/users?userId=${currentUserId}`);
      const data = await res.json();
      if (data.user) {
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          bio: data.user.bio || '',
          phone: data.user.phone || '',
          birthDate: data.user.birthDate ? new Date(data.user.birthDate).toISOString().split('T')[0] : '',
          timezone: data.user.timezone || 'Europe/Paris',
          country: data.user.country || '',
          city: data.user.city || '',
          weight: data.user.weight?.toString() || '',
          height: data.user.height?.toString() || '',
          gender: data.user.gender || '',
          mainGoal: data.user.mainGoal || '',
          activityLevel: data.user.activityLevel || 'moderate',
          dietaryPreferences: safeParseArray(data.user.dietaryPreferences),
          allergies: safeParseArray(data.user.allergies),
          favoriteCuisines: safeParseArray(data.user.favoriteCuisines),
          targetCalories: data.user.targetCalories?.toString() || '',
          proteinTarget: data.user.proteinTarget?.toString() || '',
          carbsTarget: data.user.carbsTarget?.toString() || '',
          fatTarget: data.user.fatTarget?.toString() || '',
          sportLevel: data.user.sportLevel || 'intermediate',
          preferredSports: safeParseArray(data.user.preferredSports),
          theme: data.user.theme || 'dark',
          language: data.user.language || 'fr',
        });

        // Charger les métriques calculées
        if (data.user.imc || data.user.bmr || data.user.tdee) {
          setCalculatedMetrics({
            imc: data.user.imc,
            bmr: data.user.bmr,
            tdee: data.user.tdee,
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [currentUserId, safeParseArray]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchUserProfile();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchUserProfile]);

  // Calculer automatiquement les métriques
  useEffect(() => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);

    if (weight && height) {
      const imc = weight / ((height / 100) ** 2);

      // Calcul BMR (Mifflin-St Jeor)
      let bmr = 0;
      const age = formData.birthDate
        ? Math.floor((Date.now() - new Date(formData.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 30;

      if (formData.gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else if (formData.gender === 'female') {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age;
      }

      // Calcul TDEE
      const tdee = bmr * (activityMultipliers[formData.activityLevel] || 1.55);

      /* eslint-disable react-hooks/set-state-in-effect */
      setCalculatedMetrics({ imc, bmr: Math.round(bmr), tdee: Math.round(tdee) });
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [formData.weight, formData.height, formData.gender, formData.birthDate, formData.activityLevel]);

  // Sauvegarder le profil
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          ...formData,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          targetCalories: formData.targetCalories ? parseFloat(formData.targetCalories) : null,
          proteinTarget: formData.proteinTarget ? parseFloat(formData.proteinTarget) : null,
          carbsTarget: formData.carbsTarget ? parseFloat(formData.carbsTarget) : null,
          fatTarget: formData.fatTarget ? parseFloat(formData.fatTarget) : null,
          dietaryPreferences: JSON.stringify(formData.dietaryPreferences),
          allergies: JSON.stringify(formData.allergies),
          favoriteCuisines: JSON.stringify(formData.favoriteCuisines),
          preferredSports: JSON.stringify(formData.preferredSports),
          bmr: calculatedMetrics.bmr,
          tdee: calculatedMetrics.tdee,
          imc: calculatedMetrics.imc,
        }),
      });

      if (res.ok) {
        await loadUserProfile();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle array item (for multi-select fields)
  const toggleArrayItem = useCallback((field: keyof ProfileFormData, item: string) => {
    setFormData(prev => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item],
      };
    });
  }, []);

  // Toggle section
  const toggleSection = useCallback((id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }, []);

  return {
    // State
    formData,
    setFormData,
    isSaving,
    saveSuccess,
    expandedSections,
    calculatedMetrics,
    
    // User data
    users,
    usersLoading,
    usersError,
    currentUserProfile,
    viewingUserRole,
    isAdminConnected,
    isAdminViewingOwnProfile,
    isAdmin,
    canSeeApiSection,
    currentUserId,
    setCurrentUserId,
    
    // Mutations
    createUserMutation,
    updateProfileMutation,
    deleteUserMutation,
    
    // Actions
    handleSave,
    toggleArrayItem,
    toggleSection,
    refetchUsers,
    safeParseArray,
  };
}

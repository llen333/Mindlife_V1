// React Query hooks for MindLife
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string | null;
  weight?: number | null;
  height?: number | null;
  gender?: string | null;
  mainGoal?: string | null;
  activityLevel?: string | null;
  dietaryPreferences?: string | null;
  allergies?: string | null;
  favoriteCuisines?: string | null;
  targetCalories?: number | null;
  proteinTarget?: number | null;
  carbsTarget?: number | null;
  fatTarget?: number | null;
  sportLevel?: string | null;
  preferredSports?: string | null;
  sportGoals?: string | null;
  bmr?: number | null;
  tdee?: number | null;
  imc?: number | null;
  theme?: string | null;
  language?: string | null;
  bio?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  timezone?: string;
  country?: string | null;
  city?: string | null;
}

// Hook pour récupérer tous les utilisateurs
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users?all=true');
      const data = await res.json();
      // Toujours retourner un tableau, jamais undefined
      return data.users ?? [];
    },
    staleTime: 30000, // 30 secondes
  });
}

// Hook pour récupérer le profil utilisateur actuel
export function useUserProfile(userId?: string | null) {
  // Résoudre l'ID avant de l'utiliser
  const resolvedId = userId || 'user-admin';
  
  return useQuery({
    queryKey: ['userProfile', resolvedId],
    queryFn: async () => {
      const res = await fetch(`/api/users?userId=${resolvedId}`);
      const data = await res.json();
      // Toujours retourner une valeur, jamais undefined
      return data.user ?? null;
    },
    staleTime: 30000,
    // Toujours actif car on a un ID par défaut
    enabled: true,
  });
}

// Hook pour créer un utilisateur
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, email }: { name: string; email?: string }) => {
      const id = `user-${Date.now()}`;
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: id, 
          name, 
          email: email || `${id}@mindlife.app` 
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook pour mettre à jour le profil
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
    },
  });
}

// Hook pour supprimer un utilisateur
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

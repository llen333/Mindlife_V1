'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore, UserProfile } from '@/lib/store';

// ============================================
// TYPES
// ============================================

export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string; // "admin" | "member"
  createdAt: string;
}

export interface UserFullProfile extends UserProfile {
  categories?: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    type: string;
  }>;
  _count?: {
    tasks: number;
    goals: number;
    notes: number;
    habits: number;
    events: number;
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  birthDate?: string;
  timezone?: string;
  country?: string;
  city?: string;
  weight?: number;
  height?: number;
  gender?: string;
  mainGoal?: string;
  activityLevel?: string;
  dietaryPreferences?: string[];
  allergies?: string[];
  favoriteCuisines?: string[];
  targetCalories?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  sportLevel?: string;
  preferredSports?: string[];
  sportGoals?: string[];
  theme?: string;
  language?: string;
}

export interface CreateUserData {
  name: string;
  email?: string;
}

// ============================================
// QUERY KEYS - Factory Pattern
// ============================================

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: (id: string) => [...userKeys.all, 'profile', id] as const,
};

// ============================================
// FETCHERS
// ============================================

const fetchAllUsers = async (currentUserId?: string): Promise<UserListItem[]> => {
  const url = currentUserId 
    ? `/api/users?all=true&userId=${currentUserId}`
    : '/api/users?all=true';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.users;
};

const fetchUserProfile = async (userId: string): Promise<UserFullProfile> => {
  const res = await fetch(`/api/users?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  const data = await res.json();
  return data.user;
};

const updateUserProfile = async ({
  userId,
  data,
}: {
  userId: string;
  data: UpdateProfileData;
}): Promise<UserFullProfile> => {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...data }),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  const result = await res.json();
  return result.user;
};

const createNewUser = async ({
  name,
  email,
}: CreateUserData): Promise<UserFullProfile> => {
  const id = `user-${Date.now()}`;
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: id,
      name,
      email: email || `${id}@mindlife.app`,
    }),
  });
  if (!res.ok) throw new Error('Failed to create user');
  const data = await res.json();
  return data.user;
};

const deleteUser = async (userId: string): Promise<boolean> => {
  if (userId === 'user-admin') {
    throw new Error('Cannot delete the main user');
  }
  const res = await fetch(`/api/users?userId=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return true;
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour récupérer la liste de tous les utilisateurs
 */
export function useUsers() {
  const { currentUserId, setUsers } = useStore();
  
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const users = await fetchAllUsers(currentUserId);
      // Mettre à jour le store Zustand pour la persistance localStorage
      if (users && users.length > 0) {
        setUsers(users.map(u => ({
          id: u.id,
          name: u.name,
          avatar: u.avatar,
        })));
      }
      return users;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook pour récupérer le profil complet de l'utilisateur courant
 */
export function useUserProfile() {
  const { currentUserId } = useStore();
  // Toujours avoir un ID valide pour la clé de requête
  const resolvedId = currentUserId || 'user-admin';

  return useQuery({
    queryKey: userKeys.profile(resolvedId),
    queryFn: async () => {
      console.log('📡 Fetching profile for user:', resolvedId);
      const res = await fetch(`/api/users?userId=${resolvedId}`);
      if (!res.ok) throw new Error('Failed to fetch user profile');
      const data = await res.json();
      console.log('✅ Profile fetched:', data.user?.name, 'for user:', resolvedId);
      // Toujours retourner une valeur, jamais undefined
      return data.user ?? null;
    },
    staleTime: 60 * 1000, // 1 minute (reduced from 3 for better UX on user switch)
    refetchOnMount: true, // Refetch when component mounts
    enabled: !!resolvedId, // Only run if we have an ID
  });
}

/**
 * Hook pour récupérer le profil d'un utilisateur spécifique
 */
export function useUserById(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook pour mettre à jour le profil utilisateur
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { currentUserId } = useStore();

  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      updateUserProfile({ userId: currentUserId, data }),
    
    // Optimistic update
    onMutate: async (newData) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({
        queryKey: userKeys.profile(currentUserId),
      });

      // Sauvegarder l'ancienne valeur
      const previousProfile = queryClient.getQueryData<UserFullProfile>(
        userKeys.profile(currentUserId)
      );

      // Mise à jour optimiste
      if (previousProfile) {
        queryClient.setQueryData(userKeys.profile(currentUserId), {
          ...previousProfile,
          ...newData,
        } as any);
      }

      return { previousProfile };
    },

    // En cas d'erreur, restaurer l'ancienne valeur
    onError: (err, newData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          userKeys.profile(currentUserId),
          context.previousProfile
        );
      }
      console.error('Error updating profile:', err);
    },

    // Toujours refetch après succès ou erreur
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.profile(currentUserId),
      });
    },
  });
}

/**
 * Hook pour créer un nouvel utilisateur
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  const { setCurrentUserId, setUsers, users } = useStore();

  return useMutation({
    mutationFn: createNewUser,

    onSuccess: (newUser) => {
      // Mettre à jour le store Zustand pour la persistance localStorage
      setUsers([...users, {
        id: newUser.id,
        name: newUser.name,
        avatar: newUser.avatar,
      }]);
      
      // Invalider la liste des utilisateurs
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
      
      // Changer l'utilisateur courant
      setCurrentUserId(newUser.id);
      
      // Pré-fetch le nouveau profil
      queryClient.setQueryData(userKeys.profile(newUser.id), newUser);
    },
  });
}

/**
 * Hook pour supprimer un utilisateur
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { currentUserId, setCurrentUserId, setUsers, users } = useStore();

  return useMutation({
    mutationFn: deleteUser,

    onSuccess: (_, deletedUserId) => {
      // Mettre à jour le store Zustand pour la persistance localStorage
      setUsers(users.filter(u => u.id !== deletedUserId));
      
      // Si l'utilisateur supprimé était l'utilisateur courant, revenir à mindlife-user
      if (currentUserId === deletedUserId) {
        setCurrentUserId('user-admin');
      }

      // Invalider toutes les requêtes utilisateurs
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
    },
  });
}

/**
 * Hook combiné pour gérer le changement d'utilisateur
 * Synchronise Zustand + React Query
 */
export function useSwitchUser() {
  const queryClient = useQueryClient();
  const { setCurrentUserId } = useStore();

  const switchUser = (newUserId: string) => {
    // Mettre à jour Zustand
    setCurrentUserId(newUserId);
    
    // Pré-fetch le profil du nouvel utilisateur
    queryClient.prefetchQuery({
      queryKey: userKeys.profile(newUserId),
      queryFn: () => fetchUserProfile(newUserId),
    });
  };

  return { switchUser };
}

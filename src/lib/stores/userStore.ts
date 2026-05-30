// ============================================================
// USER STORE - Gestion des utilisateurs et profil
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from './types';

interface UserState {
  currentUserId: string;
  users: { id: string; name: string | null; avatar: string | null }[];
  userProfile: UserProfile | null;
  dataLoaded: boolean;
  
  // Actions
  setCurrentUserId: (id: string) => void;
  setUsers: (users: { id: string; name: string | null; avatar: string | null }[]) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  loadUserProfile: () => Promise<void>;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  loadUsers: () => Promise<void>;
  createNewUser: (name: string) => Promise<string | null>;
  deleteUser: (userId: string) => Promise<boolean>;
  setDataLoaded: (loaded: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUserId: 'mindlife-user',
      users: [],
      userProfile: null,
      dataLoaded: false,
      
      setCurrentUserId: (id) => {
        set({ 
          currentUserId: id, 
          userProfile: null, 
          dataLoaded: false,
        });
      },
      
      setUsers: (users) => set({ users }),
      
      setUserProfile: (userProfile) => set({ userProfile }),
      
      setDataLoaded: (loaded) => set({ dataLoaded: loaded }),
      
      loadUserProfile: async () => {
        try {
          const userId = get().currentUserId;
          const res = await fetch(`/api/users?userId=${userId}`);
          const data = await res.json();
          
          // Vérifier que l'utilisateur n'a pas changé pendant la requête
          const currentUserIdNow = get().currentUserId;
          if (userId !== currentUserIdNow) return;
          
          set({ userProfile: data.user });
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      },
      
      saveUserProfile: async (profile) => {
        try {
          const userId = get().currentUserId;
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...profile }),
          });
          const data = await res.json();
          set({ userProfile: data.user });
        } catch (error) {
          console.error('Error saving user profile:', error);
        }
      },
      
      loadUsers: async () => {
        try {
          const res = await fetch('/api/users?all=true&userId=' + get().currentUserId);
          const data = await res.json();
          if (data.users && data.users.length > 0) {
            set({ users: data.users });
          }
        } catch (error) {
          console.error('Error loading users:', error);
        }
      },
      
      createNewUser: async (name) => {
        try {
          const id = `user-${Date.now()}`;
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: id, name, email: `${id}@mindlife.app` }),
          });
          await get().loadUsers();
          return id;
        } catch (error) {
          console.error('Error creating user:', error);
          return null;
        }
      },
      
      deleteUser: async (userId: string) => {
        try {
          if (userId === 'mindlife-user') {
            console.error('Cannot delete the admin user');
            return false;
          }
          
          const res = await fetch(`/api/users?userId=${userId}`, {
            method: 'DELETE',
          });
          
          if (res.ok) {
            await get().loadUsers();
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error deleting user:', error);
          return false;
        }
      },
    }),
    {
      name: 'mindlife-user-v1',
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        users: state.users,
      }),
    }
  )
);

// Sélecteurs optimisés
export const useCurrentUserId = () => useUserStore((state) => state.currentUserId);
export const useUsers = () => useUserStore((state) => state.users);
export const useUserProfile = () => useUserStore((state) => state.userProfile);
export const useDataLoaded = () => useUserStore((state) => state.dataLoaded);

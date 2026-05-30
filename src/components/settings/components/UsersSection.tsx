'use client';

import { User, UserPlus, Crown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileFormData } from '../types';

interface UserItem {
  id: string;
  name: string | null;
  email?: string | null;
  role: string;
}

interface UsersSectionProps {
  isAdmin: boolean;
  users: UserItem[];
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  currentUserProfile: any;
  expanded: boolean;
  onShowNewUserModal: () => void;
  refetchUsers: () => void;
}

export function UsersSection({
  isAdmin,
  users,
  currentUserId,
  setCurrentUserId,
  currentUserProfile,
  expanded,
  onShowNewUserModal,
  refetchUsers,
}: UsersSectionProps) {
  if (!expanded) return null;

  // Vue Admin
  if (isAdmin) {
    return (
      <div className="overflow-hidden animate-expand">
        <div className="px-6 pb-8 space-y-6">
          {/* Info Admin */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <Crown className="w-5 h-5 text-green-400" />
            <p className="text-sm text-green-400">
              Vous êtes administrateur. Vous pouvez gérer tous les utilisateurs.
            </p>
          </div>

          {/* Liste des utilisateurs */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              Utilisateurs existants ({users?.length || 0})
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(users || []).map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                    currentUserId === user.id
                      ? "bg-green-500/15 border-green-500/40"
                      : "bg-white/5 border-white/10 hover:border-green-500/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold",
                        currentUserId === user.id
                          ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white"
                          : "bg-white/10 text-white/60"
                      )}
                    >
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{user.name || 'Utilisateur'}</p>
                        {user.role === 'admin' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40">
                        {user.role === 'admin' ? 'Administrateur' : 'Membre'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUserId === user.id && (
                      <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold">
                        Actif
                      </span>
                    )}
                    {user.role !== 'admin' && (
                      <button
                        onClick={async () => {
                          if (confirm(`Supprimer l'utilisateur "${user.name}" ?`)) {
                            try {
                              const res = await fetch(
                                `/api/users?userId=${user.id}&requestingUserId=${currentUserId}`,
                                { method: 'DELETE' }
                              );
                              if (res.ok) {
                                refetchUsers();
                              } else {
                                const data = await res.json();
                                alert(data.error || 'Erreur lors de la suppression');
                              }
                            } catch (error) {
                              alert('Erreur lors de la suppression');
                            }
                          }
                        }}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        title="Supprimer cet utilisateur"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton créer */}
          <button
            onClick={onShowNewUserModal}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 font-bold hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Créer un nouvel utilisateur (membre)
          </button>
        </div>
      </div>
    );
  }

  // Vue Membre
  return (
    <div className="overflow-hidden animate-expand">
      <div className="px-6 pb-8 space-y-6">
        {/* Info Member */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <User className="w-5 h-5 text-blue-400" />
          <p className="text-sm text-blue-400">
            Vous êtes membre. Vous pouvez uniquement gérer votre propre profil.
          </p>
        </div>

        {/* Infos du compte */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xl font-bold text-white">
              {currentUserProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-white">{currentUserProfile?.name || 'Utilisateur'}</p>
              <p className="text-xs text-white/40">{currentUserProfile?.email}</p>
            </div>
          </div>
        </div>

        {/* Avertissement suppression */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-400 mb-1">Zone sensible</p>
              <p className="text-sm text-red-400/80">
                La suppression de votre compte est définitive. Toutes vos données seront perdues.
              </p>
            </div>
          </div>
        </div>

        {/* Bouton supprimer mon compte */}
        <button
          onClick={async () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
              if (confirm('Dernière confirmation : Toutes vos données seront définitivement supprimées. Continuer ?')) {
                try {
                  const res = await fetch(`/api/users?userId=${currentUserId}`, { method: 'DELETE' });
                  if (res.ok) {
                    setCurrentUserId('mindlife-user');
                    window.location.reload();
                  } else {
                    const data = await res.json();
                    alert(data.error || 'Erreur lors de la suppression');
                  }
                } catch (error) {
                  alert('Erreur lors de la suppression du compte');
                }
              }
            }
          }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold hover:bg-red-500/30 transition-all"
        >
          <AlertTriangle className="w-5 h-5" />
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}

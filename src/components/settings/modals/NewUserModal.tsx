'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewUserModalProps {
  show: boolean;
  onClose: () => void;
  userName: string;
  setUserName: (name: string) => void;
  onCreate: () => void;
  isLoading: boolean;
}

export function NewUserModal({
  show,
  onClose,
  userName,
  setUserName,
  onCreate,
  isLoading,
}: NewUserModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-[#0a0f1a] border border-white/10 rounded-3xl p-8 w-full max-w-md animate-scale-in"
        style={{
          boxShadow: '0 0 60px rgba(34, 197, 94, 0.2)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        <h3 className="text-2xl font-black text-white mb-2">Nouvel Utilisateur</h3>
        <p className="text-sm text-white/40 mb-6">
          Créer un nouveau profil membre
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              Nom de l'utilisateur
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-green-500/40 focus:bg-green-500/5 transition-all text-white placeholder:text-white/20"
              placeholder="Jean Dupont"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={onCreate}
              disabled={!userName.trim() || isLoading}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                userName.trim() && !isLoading
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              )}
            >
              {isLoading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

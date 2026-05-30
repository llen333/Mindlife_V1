// StartSessionModal - Modal to confirm starting a session
'use client';

import { ModalTransparent } from './ModalTransparent';

interface StartSessionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function StartSessionModal({ isVisible, onClose, onStart }: StartSessionModalProps) {
  if (!isVisible) return null;

  return (
    <ModalTransparent onClose={onClose}>
      <h3 className="text-xl font-black uppercase mb-4">Démarrer la Session</h3>
      <p className="text-white/60 mb-6">Prêt à commencer votre séance du jour ?</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold"
        >
          Annuler
        </button>
        <button
          onClick={onStart}
          className="flex-1 px-4 py-3 rounded-xl bg-[#00f2ff] text-[#050505] font-bold hover:bg-[#00f2ff]/80 transition-all"
        >
          Démarrer
        </button>
      </div>
    </ModalTransparent>
  );
}

// NewNoteModal - Modal for creating new spirit notes
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';

interface NewNoteModalProps {
  isVisible: boolean;
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function NewNoteModal({
  isVisible,
  content,
  onContentChange,
  onSave,
  onClose,
}: NewNoteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animation
  useEffect(() => {
    if (isVisible && modalRef.current && contentRef.current) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(contentRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [isVisible]);

  // Close with animation
  const handleClose = useCallback(() => {
    if (modalRef.current && contentRef.current) {
      gsap.to(modalRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(contentRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        className="extreme-glass p-8 rounded-[2rem] w-full max-w-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-light tracking-widest text-slate-200 uppercase">
            Capturer un Murmure
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-light text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-purple-500/40 focus:border-purple-500/40 outline-none resize-none"
          placeholder="Votre pensée, intuition ou révélation..."
        />

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-full border border-white/10 text-slate-400 text-sm uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={!content.trim()}
            className="flex-1 py-3 rounded-full bg-purple-500 text-black text-sm uppercase tracking-widest font-bold hover:bg-purple-400 transition-colors disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

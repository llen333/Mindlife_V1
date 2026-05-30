// ModalTransparent - Base modal component with GSAP animations
'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface ModalTransparentProps {
  children: React.ReactNode;
  onClose: () => void;
  large?: boolean;
}

export function ModalTransparent({ children, onClose, large = false }: ModalTransparentProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (overlay && content) {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(content, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" });
    }

    return () => {
      if (overlay) gsap.killTweensOf(overlay);
      if (content) gsap.killTweensOf(content);
    };
  }, []);

  const handleClose = () => {
    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (overlay && content) {
      gsap.to(overlay, { opacity: 0, duration: 0.15 });
      gsap.to(content, {
        scale: 0.95,
        opacity: 0,
        duration: 0.15,
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        onClick={e => e.stopPropagation()}
        className={cn(
          "relative bg-[#0a0f1a]/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto",
          large ? "max-w-3xl w-full" : "max-w-lg w-full"
        )}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/40" />
        </button>
        {children}
      </div>
    </div>
  );
}

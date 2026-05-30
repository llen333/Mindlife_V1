// HistoryModal - Modal for viewing conversation history
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X, History, Play, Trash2, Brain, Heart, Target } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import type { SavedConversation, ChatMessage } from '../types';

interface HistoryModalProps {
  isVisible: boolean;
  conversations: SavedConversation[];
  onClose: () => void;
  onLoadConversation: (conv: SavedConversation) => void;
  onDeleteConversation: (id: string) => void;
}

export function HistoryModal({
  isVisible,
  conversations,
  onClose,
  onLoadConversation,
  onDeleteConversation,
}: HistoryModalProps) {
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

  // Get archetype icon and color
  const getArchetypeStyle = (archetype: string) => {
    switch (archetype) {
      case 'psychologue':
        return { icon: Brain, colorClass: 'bg-violet-500/20 text-violet-400' };
      case 'ami':
        return { icon: Heart, colorClass: 'bg-emerald-500/20 text-emerald-400' };
      case 'stoicien':
        return { icon: Target, colorClass: 'bg-purple-500/20 text-purple-400' };
      default:
        return { icon: Brain, colorClass: 'bg-purple-500/20 text-purple-400' };
    }
  };

  // Get archetype name
  const getArchetypeName = (archetype: string) => {
    switch (archetype) {
      case 'psychologue':
        return 'Le Psychologue';
      case 'ami':
        return "L'Ami";
      case 'stoicien':
        return 'Le Stoïcien';
      default:
        return archetype;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        className="extreme-glass p-8 rounded-[2rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-light tracking-widest text-white uppercase">
              Historique Spirituel
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {conversations.length} conversation{conversations.length > 1 ? 's' : ''} enregistrée{conversations.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <History className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-slate-500 italic">Aucune conversation enregistrée</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const style = getArchetypeStyle(conv.archetype);
              const Icon = style.icon;

              return (
                <div
                  key={conv.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        style.colorClass
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white capitalize">
                          {getArchetypeName(conv.archetype)}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {new Date(conv.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                        {conv.messageCount} messages
                      </span>
                      <button
                        onClick={() => {
                          onLoadConversation(conv);
                          handleClose();
                        }}
                        className="text-purple-400 hover:text-purple-300 p-1.5 rounded-full hover:bg-purple-500/10 transition-colors"
                        title="Reprendre cette conversation"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteConversation(conv.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-full hover:bg-red-500/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    {(conv.messages || []).slice(0, 4).map((msg: ChatMessage, i: number) => (
                      <div
                        key={i}
                        className={cn(
                          "flex gap-2 text-sm",
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <span className={cn(
                          "text-xs font-semibold uppercase px-2 py-0.5 rounded",
                          msg.role === 'user'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-slate-700/50 text-slate-300'
                        )}>
                          {msg.role === 'user' ? 'Vous' : 'Guide'}
                        </span>
                        <p className={cn(
                          "flex-1 text-xs leading-relaxed",
                          msg.role === 'user' ? 'text-slate-300 text-right' : 'text-slate-400'
                        )}>
                          {msg.content.length > 150 ? msg.content.slice(0, 150) + '...' : msg.content}
                        </p>
                      </div>
                    ))}
                    {(conv.messages?.length || 0) > 4 && (
                      <p className="text-xs text-slate-600 italic text-center pt-2">
                        +{(conv.messages?.length || 0) - 4} messages supplémentaires
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

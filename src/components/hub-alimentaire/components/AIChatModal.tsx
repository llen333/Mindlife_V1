'use client';

import { X, Bot, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '../types';

interface AIChatModalProps {
  isOpen: boolean;
  chatMessages: ChatMessage[];
  chatInput: string;
  isAITyping: boolean;
  modalRef: React.RefObject<HTMLDivElement | null>;
  modalContentRef: React.RefObject<HTMLDivElement | null>;
  chatMessagesRef: React.RefObject<HTMLDivElement | null>;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

/**
 * Modal de chat avec l'assistant IA nutritionnel
 */
export function AIChatModal({
  isOpen,
  chatMessages,
  chatInput,
  isAITyping,
  modalRef,
  modalContentRef,
  chatMessagesRef,
  chatEndRef,
  onClose,
  onInputChange,
  onSendMessage,
}: AIChatModalProps) {
  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0a1210] rounded-2xl border border-emerald-500/20 overflow-hidden shadow-2xl"
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Assistant Nutrition IA</h3>
              <p className="text-xs text-emerald-400">Spécialiste Diététique</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div ref={chatMessagesRef} className="h-80 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400 text-sm">
                Bonjour ! Je suis votre assistant nutrition personnalisé.
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Posez-moi vos questions sur l&apos;alimentation, les recettes, ou vos objectifs.
              </p>
            </div>
          )}
          
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "chat-message flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div className={cn(
                "max-w-[80%] p-3 rounded-xl text-sm",
                message.role === 'user'
                  ? "bg-emerald-500 text-white"
                  : "bg-white/5 text-slate-300"
              )}>
                {message.content}
              </div>
            </div>
          ))}
          
          {isAITyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
              placeholder="Posez votre question..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
            />
            <button
              onClick={onSendMessage}
              disabled={!chatInput.trim() || isAITyping}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

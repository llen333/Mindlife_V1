// ChatPanel - Main chat interface with archetypes
'use client';

import { useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Loader2,
  History,
  Star,
  Trash2,
  Brain,
  Heart,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '../types';
import { archetypes } from '../constants';

interface ChatPanelProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  selectedArchetype: string;
  setSelectedArchetype: (archetype: string) => void;
  isLoading: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  audioLevel: number;
  savedConversationsCount: number;
  onSendMessage: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onOpenHistory: () => void;
  onSaveConversation: () => void;
  onReset: () => void;
}

export function ChatPanel({
  chatMessages,
  chatInput,
  setChatInput,
  selectedArchetype,
  setSelectedArchetype,
  isLoading,
  isRecording,
  isProcessing,
  audioLevel,
  savedConversationsCount,
  onSendMessage,
  onStartRecording,
  onStopRecording,
  onOpenHistory,
  onSaveConversation,
  onReset,
}: ChatPanelProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="extreme-glass rounded-[3rem] p-10 min-h-[500px] flex flex-col relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.02] to-transparent pointer-events-none" />

      <div className="text-center mb-12 relative z-10">
        <h2 className="text-lg tracking-[0.4em] uppercase font-light text-slate-100">
          Dialogue avec l'Infini
        </h2>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mx-auto mt-4" />
      </div>

      {/* Archetype Selection */}
      <div className="flex justify-center gap-8 mb-12 relative z-10">
        {archetypes.map((archetype) => {
          const Icon = archetype.icon;
          const isSelected = selectedArchetype === archetype.id;
          return (
            <div
              key={archetype.id}
              onClick={() => setSelectedArchetype(archetype.id)}
              className={cn(
                "flex flex-col items-center gap-3 group cursor-pointer transition-all",
                !isSelected && "opacity-40 hover:opacity-100"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full border flex items-center justify-center transition-all",
                isSelected
                  ? "border-purple-500/30 bg-purple-500/10 text-purple-500"
                  : "border-white/20 text-slate-300"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[9px] uppercase tracking-widest transition-colors",
                isSelected ? "text-slate-200" : "text-slate-500"
              )}>
                {archetype.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 space-y-4 overflow-y-auto mb-4 px-4 custom-scrollbar"
        style={{ minHeight: '200px', maxHeight: '200px', overscrollBehavior: 'contain' }}
      >
        {isProcessing && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400 mr-2" />
            <span className="text-[11px] uppercase tracking-widest text-purple-400">
              Analyse en cours...
            </span>
          </div>
        )}
        {!isProcessing && chatMessages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "px-5 py-3 rounded-2xl max-w-[85%]",
              msg.role === 'user'
                ? "bg-purple-500/5 border border-purple-500/20 backdrop-blur-md rounded-br-none"
                : "ethereal-bubble rounded-tl-none"
            )}>
              <p className={cn(
                "text-sm font-light leading-relaxed",
                msg.role === 'assistant' ? "text-slate-300 italic" : "text-slate-200"
              )}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mb-3">
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-2 text-[11px] text-purple-400 hover:text-purple-300 transition-colors py-1.5 px-3 rounded-full bg-purple-500/10 border border-purple-500/20"
        >
          <History className="w-3.5 h-3.5" />
          <span>Historique ({savedConversationsCount})</span>
        </button>
        <button
          onClick={onSaveConversation}
          className="flex items-center gap-2 text-[11px] text-green-400 hover:text-green-300 transition-colors py-1.5 px-3 rounded-full bg-green-500/10 border border-green-500/20"
        >
          <Star className="w-3.5 h-3.5" />
          <span>Sauvegarder</span>
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-slate-300 transition-colors py-1.5 px-3 rounded-full bg-white/5 border border-white/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Chat Input with Voice */}
      <div className="relative z-10">
        <div className={cn(
          "w-full bg-white/5 border rounded-full transition-all",
          isRecording ? "border-purple-500/50 bg-purple-500/10" : "border-white/10"
        )}>
          {isRecording && (
            <div className="flex items-center justify-center py-4 gap-1 h-12">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-purple-500 to-violet-400 rounded-full animate-audio-bar"
                  style={{
                    minHeight: '8px',
                    maxHeight: '24px',
                    animationDelay: `${i * 0.03}s`,
                    ['--audio-level' as string]: `${Math.min(24, 8 + audioLevel * 0.15)}px`
                  }}
                />
              ))}
              <span className="ml-3 text-[10px] text-purple-400 animate-pulse whitespace-nowrap">
                Écoute... 3s silence pour envoyer
              </span>
            </div>
          )}
          {!isRecording && (
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
              disabled={isProcessing}
              className="w-full bg-transparent py-4 px-6 pr-28 text-sm font-light tracking-wide focus:outline-none placeholder:text-slate-600"
              placeholder="Confiez votre murmure à l'univers..."
            />
          )}
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={cn(
              "p-2 rounded-full transition-all",
              isRecording ? "bg-red-500/20 text-red-400" : "text-slate-400 hover:text-purple-400 hover:bg-purple-500/10"
            )}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          {!isRecording && (
            <button
              onClick={onSendMessage}
              disabled={isLoading || !chatInput.trim()}
              className="p-2 rounded-full text-purple-500 disabled:opacity-50 hover:bg-purple-500/10 transition-all"
            >
              {isLoading || isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

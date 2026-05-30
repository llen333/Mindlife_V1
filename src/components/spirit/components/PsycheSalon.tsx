// PsycheSalon - Oracle voice interface
'use client';

import { useState } from 'react';
import {
  MessageCircle,
  Brain,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PsycheSalonProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  messages?: Array<{role: 'user' | 'oracle'; content: string}>;
}

export function PsycheSalon({
  isRecording,
  onStartRecording,
  onStopRecording,
  onSendMessage,
  isTyping,
  messages = [],
}: PsycheSalonProps) {
  const [oracleInput, setOracleInput] = useState('');

  const handleSend = () => {
    if (oracleInput.trim()) {
      onSendMessage(oracleInput);
      setOracleInput('');
    }
  };

  return (
    <section id="psyche" className="space-y-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-green-500" />
          <h2 className="text-xl tracking-[0.5em] uppercase font-light text-slate-100">
            Le Salon de Psyché
          </h2>
        </div>
        <p className="text-[11px] uppercase tracking-widest text-slate-500 max-w-md mx-auto leading-loose">
          Espace sacré d'analyse vocale & thérapeutique. L'Oracle Psyché écoute les vibrations de votre âme.
        </p>
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
      </div>

      <div className="extreme-glass rounded-[4rem] p-16 max-w-5xl mx-auto relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/[0.03] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Oracle Avatar */}
          <div className="mb-12 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border border-green-500/20 flex items-center justify-center bg-green-500/5 mb-4 psyche-glow">
              <Brain className="w-10 h-10 text-green-500 animate-pulse" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-green-500 font-medium">
              L'Oracle Psyché est à l'écoute
            </span>
          </div>

          {/* Microphone Button */}
          <div className="relative mb-16">
            <div className="absolute -inset-16 bg-green-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={isRecording ? onStopRecording : onStartRecording}
              className={cn(
                "interactive-button relative w-32 h-32 rounded-full bg-black border flex items-center justify-center transition-all",
                isRecording
                  ? "border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                  : "border-green-500/30 hover:border-green-500/50"
              )}
            >
              <div className="absolute inset-2 border border-green-500/10 rounded-full" />
              <div className={cn(
                "absolute -inset-2 rounded-full transition-colors",
                isRecording
                  ? "bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
                  : "bg-green-500/5 group-hover:bg-green-500/10"
              )} />
              {isRecording ? (
                <MicOff className="w-12 h-12 text-red-500" />
              ) : (
                <Mic className="w-12 h-12 text-green-500" />
              )}
            </button>

            {/* Sound Wave Indicator */}
            {isRecording && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-1.5 h-6">
                {[2, 4, 3, 5, 2, 4, 3, 5, 2].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500/60 rounded-full animate-sound-wave-bar"
                    style={{
                      '--wave-min': `${h * 4}px`,
                      '--wave-max': `${h * 8}px`,
                      animationDelay: `${i * 0.05}s`
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Conversation History */}
          {messages.length > 0 && (
            <div className="w-full max-w-2xl mb-8 max-h-80 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-2xl px-5 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-white/[0.04] border border-white/10 text-slate-300 text-right ml-8'
                      : 'bg-green-500/[0.06] border border-green-500/20 text-green-200 mr-8'
                  )}
                >
                  {msg.role === 'oracle' && (
                    <span className="text-[9px] uppercase tracking-widest text-green-500/60 block mb-1">L'Oracle</span>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              {isTyping && (
                <div className="bg-green-500/[0.06] border border-green-500/20 rounded-2xl px-5 py-3 mr-8">
                  <span className="text-[9px] uppercase tracking-widest text-green-500/60 block mb-1">L'Oracle</span>
                  <div className="flex gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{animationDelay:'0s'}}/>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{animationDelay:'0.2s'}}/>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{animationDelay:'0.4s'}}/>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Input */}
          <div className="w-full max-w-2xl relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <MessageCircle className="w-4 h-4 text-slate-500" />
            </div>
            <input
              value={oracleInput}
              onChange={(e) => setOracleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
              className="w-full bg-white/[0.03] border border-white/10 rounded-full py-5 px-14 text-sm font-light tracking-wide focus:ring-1 focus:ring-green-500/40 focus:border-green-500/40 transition-all placeholder:text-slate-600 outline-none"
              placeholder="Ou déposez ici vos maux par écrit..."
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !oracleInput.trim()}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-green-500 disabled:opacity-50"
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            </button>
          </div>

          {/* Privacy Indicators */}
          <div className="mt-8 flex gap-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
              <span className="text-[9px] uppercase tracking-widest text-slate-500">
                Confidentialité Absolue
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
              <span className="text-[9px] uppercase tracking-widest text-slate-500">
                Analyse de Proximité
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

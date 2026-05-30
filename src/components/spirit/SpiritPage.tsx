// SpiritPage - Main spiritual sanctuary page (refactored)
'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Plus, History, Compass } from 'lucide-react';
import { useStore } from '@/lib/store';
import MindLifeHeader from '../MindLifeHeader';
import { getAIConfig } from '@/lib/ai-config';

// Hooks
import { useSpiritChat, useVoiceRecording, useFrequencies, useSpiritNotes } from './hooks';

// Components
import {
  FrequenciesPanel,
  ChatPanel,
  EvolutionMarkers,
  SoulArchives,
  PsycheSalon,
  QuotesPanel,
  OdyseeTimeline,
} from './components';

// Modals
import { NewNoteModal, HistoryModal } from './modals';

export default function SpiritPage() {
  const { isLoading, setIsLoading } = useStore();
  const [selectedArchetype, setSelectedArchetype] = useState('stoicien');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isOracleTyping, setIsOracleTyping] = useState(false);
  const [oracleMessages, setOracleMessages] = useState<Array<{role: 'user'|'oracle'; content: string}>>([]);

  // Hooks
  const {
    chatMessages,
    chatInput,
    setChatInput,
    savedConversations,
    isLoading: chatLoading,
    sendChatMessage,
    saveConversation,
    resetChat,
    loadConversation,
    deleteConversation,
  } = useSpiritChat(selectedArchetype);

  const { frequencies, toggleFrequency } = useFrequencies();

  const {
    notes,
    cards,
    showNewNoteModal,
    newNoteContent,
    setNewNoteContent,
    addNote,
    getCardsByStatus,
    openNewNoteModal,
    closeNewNoteModal,
  } = useSpiritNotes();

  // Voice recording hook
  const {
    isRecording,
    audioLevel,
    isProcessing,
    startRecording,
    stopRecording,
  } = useVoiceRecording(
    selectedArchetype,
    chatMessages,
    async (message, archetype, history) => {
      const response = await fetch('/api/spirit-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, archetype, history: history.slice(-6) }),
      });
      const data = await response.json();
      return data.message || "Je suis là pour t'accompagner.";
    },
    saveConversation,
    setIsLoading
  );

  // Oracle message handler
  const sendOracleMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setOracleMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsOracleTyping(true);
    setIsLoading(true);

    try {
      const aiConfig = getAIConfig();
      const res = await fetch('/api/oracle-psyche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userMemory: aiConfig.userMemory }),
      });
      const data = await res.json();
      const oracleReply = data.message || "L'Oracle médite en silence...";
      setOracleMessages(prev => [...prev, { role: 'oracle', content: oracleReply }]);
    } catch (error) {
      console.error('Oracle error:', error);
      setOracleMessages(prev => [...prev, { role: 'oracle', content: "✨ L'Oracle traverse les vents du cosmos... Réessaie dans un instant." }]);
    } finally {
      setIsOracleTyping(false);
      setIsLoading(false);
    }
  }, [setIsLoading]);

  return (
    <div className="min-h-screen bg-black text-slate-200 overflow-x-hidden">
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes wave-bar {
          0%, 100% { height: 20%; }
          50% { height: var(--wave-height, 100%); }
        }
        .animate-wave-bar {
          animation: wave-bar 0.5s ease-in-out infinite;
          height: 100%;
        }
        @keyframes audio-bar {
          0%, 100% { height: 8px; }
          50% { height: var(--audio-level, 16px); }
        }
        .animate-audio-bar {
          animation: audio-bar 0.15s ease-in-out infinite;
        }
      `}</style>

      {/* Nebula Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 50% 90%, rgba(34, 197, 94, 0.05) 0%, transparent 40%)
          `,
          filter: 'blur(80px)',
        }}
      />

      {/* Header */}
      <MindLifeHeader
        title="MindLife"
        subtitle="Sanctuaire & Salon de Psyché"
        icon={Sparkles}
        theme="purple"
        showBackButton={true}
        rightContent={
          <nav className="hidden md:flex gap-6 text-[10px] uppercase tracking-[0.2em] font-light text-slate-400">
            <button
              onClick={() => document.getElementById('odysee')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-purple-500 transition-colors"
            >
              Odyssée
            </button>
            <button
              onClick={() => document.getElementById('marqueurs')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-purple-500 transition-colors"
            >
              Actions
            </button>
            <button
              onClick={() => document.getElementById('psyche')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-purple-500 transition-colors"
            >
              Salon
            </button>
          </nav>
        }
      />

      {/* Main Content */}
      <main className="pt-32 pb-64 px-10 max-w-[1700px] mx-auto space-y-24 relative z-10">

        {/* Top Grid: Frequencies + Chat + Quotes */}
        <div className="grid grid-cols-12 gap-10">
          {/* Left Aside: Frequencies */}
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            <FrequenciesPanel
              frequencies={frequencies}
              onToggleFrequency={toggleFrequency}
            />
          </aside>

          {/* Center: Chat with Infini */}
          <section className="col-span-12 lg:col-span-6 space-y-10">
            <ChatPanel
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              selectedArchetype={selectedArchetype}
              setSelectedArchetype={setSelectedArchetype}
              isLoading={chatLoading}
              isRecording={isRecording}
              isProcessing={isProcessing}
              audioLevel={audioLevel}
              savedConversationsCount={savedConversations.length}
              onSendMessage={sendChatMessage}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onOpenHistory={() => setShowHistoryModal(true)}
              onSaveConversation={() => saveConversation(chatMessages, selectedArchetype)}
              onReset={resetChat}
            />

            {/* Odyssée du Soi */}
            <OdyseeTimeline />
          </section>

          {/* Right Aside: Connexions Stellaires */}
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            <QuotesPanel />
          </aside>
        </div>

        {/* Marqueurs d'Évolution */}
        <EvolutionMarkers cards={cards} getCardsByStatus={getCardsByStatus} />

        {/* Archives de l'Âme */}
        <SoulArchives notes={notes} />

        {/* Salon de Psyché */}
        <PsycheSalon
          isRecording={isRecording}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onSendMessage={sendOracleMessage}
          isTyping={isOracleTyping}
          messages={oracleMessages}
        />
      </main>

      {/* Floating Bottom Buttons */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-8">
        <button className="text-slate-500 hover:text-purple-500 transition-colors">
          <History className="w-7 h-7" />
        </button>

        <button
          onClick={openNewNoteModal}
          className="interactive-button relative group"
        >
          <div className="absolute -inset-8 star-button rounded-full opacity-30 blur-2xl group-hover:opacity-60 transition-opacity" />
          <div className="w-16 h-16 rounded-full star-button flex items-center justify-center relative z-10">
            <Plus className="w-8 h-8 text-black" />
          </div>
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-purple-500 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
            Capturer un Murmure
          </span>
        </button>

        <button className="text-slate-500 hover:text-purple-500 transition-colors">
          <Compass className="w-7 h-7" />
        </button>
      </div>

      {/* New Note Modal */}
      <NewNoteModal
        isVisible={showNewNoteModal}
        content={newNoteContent}
        onContentChange={setNewNoteContent}
        onSave={addNote}
        onClose={closeNewNoteModal}
      />

      {/* History Modal */}
      <HistoryModal
        isVisible={showHistoryModal}
        conversations={savedConversations}
        onClose={() => setShowHistoryModal(false)}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
      />

      {/* Global Styles */}
      <style jsx global>{`
        .extreme-glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(32px) saturate(120%);
          -webkit-backdrop-filter: blur(32px) saturate(120%);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .extreme-glass:hover {
          border-color: rgba(255, 255, 255, 0.08);
        }
        .ethereal-bubble {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .star-button {
          background: radial-gradient(circle at center, #ffffff 0%, #a855f7 40%, transparent 100%);
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
        }
        .psyche-glow {
          box-shadow: 0 0 50px rgba(34, 197, 94, 0.2), 0 0 100px rgba(34, 197, 94, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

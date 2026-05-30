// Section 4: Psyche Development - With Global Media Player
'use client';

import { useState, useCallback } from 'react';
import { 
  Brain, Sparkles, BookOpen, Video, Play, RotateCcw,
  ChevronRight, Heart, Feather, Infinity, Clock, RefreshCw, Lightbulb
} from 'lucide-react';
import type { PsycheResource, MentalCard, SpiritualityPractice } from '../types';
import { PsycheResourceModal, MentalCardModal } from '../modals';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

interface PsycheSectionProps {
  resources: PsycheResource[];
  mentalCards: MentalCard[];
  practices: SpiritualityPractice[];
}

export function PsycheSection({ resources, mentalCards, practices }: PsycheSectionProps) {
  const [selectedResource, setSelectedResource] = useState<PsycheResource | null>(null);
  const [showCards, setShowCards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Global media player
  const { playMedia, currentMedia } = useMediaPlayer();

  // Group resources by source
  const nevilleResources = resources.filter(r => r.source === 'neville-goddard');
  const jungResources = resources.filter(r => r.source === 'carl-jung');
  const hermesResources = resources.filter(r => r.source === 'hermes');
  const otherResources = resources.filter(r => !['neville-goddard', 'carl-jung', 'hermes'].includes(r.source || ''));

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleNextCard = useCallback(() => {
    setIsFlipped(false);
    setCurrentCardIndex(prev => Math.min(prev + 1, mentalCards.length - 1));
  }, [mentalCards.length]);

  const handlePrevCard = useCallback(() => {
    setIsFlipped(false);
    setCurrentCardIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleResourceClick = (resource: PsycheResource) => {
    if (resource.type === 'video' && resource.url) {
      // Play in global player
      playMedia({
        id: resource.id,
        title: resource.title,
        author: resource.author,
        type: 'video',
        url: resource.url,
        imageUrl: resource.imageUrl,
        description: resource.description,
      });
    } else {
      setSelectedResource(resource);
    }
  };

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-light text-white tracking-wide">Développement Psyché</h2>
            <p className="text-white/40 text-sm">Sagesse ésotérique et pratique mentale</p>
          </div>
        </div>
      </div>

      {/* Mental Cards Section */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <RefreshCw className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-light">Cartes Mentales</h3>
              <p className="text-white/40 text-sm">{mentalCards.length} cartes à réviser</p>
            </div>
          </div>
          <button
            onClick={() => setShowCards(true)}
            className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all flex items-center gap-2 backdrop-blur-sm"
          >
            <Play className="w-4 h-4" />
            Réviser
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="text-2xl font-light text-white">{mentalCards.length}</div>
            <div className="text-white/40 text-xs">Total</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="text-2xl font-light text-emerald-400">
              {mentalCards.filter(c => (c.masteryLevel ?? 0) >= 80).length}
            </div>
            <div className="text-white/40 text-xs">Maîtrisées</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="text-2xl font-light text-amber-400">
              {mentalCards.filter(c => (c.masteryLevel ?? 0) >= 40 && (c.masteryLevel ?? 0) < 80).length}
            </div>
            <div className="text-white/40 text-xs">En cours</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="text-2xl font-light text-white/50">
              {mentalCards.filter(c => (c.masteryLevel ?? 0) < 40).length}
            </div>
            <div className="text-white/40 text-xs">À apprendre</div>
          </div>
        </div>
      </div>

      {/* Resources by Source */}
      <div className="grid grid-cols-12 gap-6">
        {/* Neville Goddard */}
        <div className="col-span-12 lg:col-span-6">
          <SourcePanel
            title="Neville Goddard"
            subtitle="L'Imagination Créatrice"
            icon={Sparkles}
            color="purple"
            resources={nevilleResources}
            onSelect={handleResourceClick}
          />
        </div>

        {/* Carl Jung */}
        <div className="col-span-12 lg:col-span-6">
          <SourcePanel
            title="Carl Jung"
            subtitle="Psychologie Analytique"
            icon={Brain}
            color="blue"
            resources={jungResources}
            onSelect={handleResourceClick}
          />
        </div>

        {/* Hermès Trismégiste */}
        <div className="col-span-12 lg:col-span-6">
          <SourcePanel
            title="Hermès Trismégiste"
            subtitle="Sagesse Hermétique"
            icon={Infinity}
            color="amber"
            resources={hermesResources}
            onSelect={handleResourceClick}
          />
        </div>

        {/* Other Sources */}
        <div className="col-span-12 lg:col-span-6">
          <SourcePanel
            title="Autres Sources"
            subtitle="La Synchronicité, Thot, etc."
            icon={Lightbulb}
            color="teal"
            resources={otherResources}
            onSelect={handleResourceClick}
          />
        </div>
      </div>

      {/* Practices */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <Feather className="w-5 h-5 text-pink-400" />
          <h3 className="text-white/80 text-sm uppercase tracking-wider">Pratiques Spirituelles</h3>
        </div>
        <div className="grid grid-cols-12 gap-4">
          {practices.map((practice) => (
            <PracticeCard key={practice.id} practice={practice} />
          ))}
        </div>
      </div>

      {/* Modals */}
      <PsycheResourceModal
        isVisible={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        resource={selectedResource}
      />
      <MentalCardModal
        isVisible={showCards}
        onClose={() => setShowCards(false)}
        cards={mentalCards}
        currentIndex={currentCardIndex}
        onFlip={handleFlip}
        onNext={handleNextCard}
        onPrev={handlePrevCard}
        isFlipped={isFlipped}
      />
    </section>
  );
}

// ============================================
// SOURCE PANEL
// ============================================

interface SourcePanelProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  resources: PsycheResource[];
  onSelect: (resource: PsycheResource) => void;
}

function SourcePanel({ title, subtitle, icon: Icon, color, resources, onSelect }: SourcePanelProps) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30' },
  };
  const classes = colorClasses[color] || colorClasses.purple;

  return (
    <div className={`p-6 rounded-2xl bg-white/5 border border-white/10 hover:${classes.border} transition-colors`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl ${classes.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${classes.text}`} />
        </div>
        <div>
          <h3 className="text-white font-light">{title}</h3>
          <p className="text-white/40 text-sm">{subtitle}</p>
        </div>
        <span className="ml-auto text-white/30 text-sm">{resources.length}</span>
      </div>

      <div className="space-y-3">
        {resources.slice(0, 4).map((resource) => (
          <div
            key={resource.id}
            onClick={() => onSelect(resource)}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-all group"
          >
            {/* Thumbnail or Icon */}
            {resource.imageUrl ? (
              <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img src={resource.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-16 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                {resource.type === 'video' ? (
                  <Video className="w-5 h-5 text-white/30" />
                ) : (
                  <BookOpen className="w-5 h-5 text-white/30" />
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-light text-sm truncate">{resource.title}</div>
              <div className="text-white/40 text-xs mt-1">{resource.type}</div>
              {/* Status */}
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  resource.status === 'integrated' ? 'bg-emerald-500/20 text-emerald-400' :
                  resource.status === 'exploring' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-white/10 text-white/50'
                }`}>
                  {resource.status === 'integrated' ? 'Intégré' :
                   resource.status === 'exploring' ? 'En exploration' : 'À explorer'}
                </span>
                {resource.type === 'video' && (
                  <span className="text-white/30 text-[10px]">▶ Cliquez pour lire</span>
                )}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
          </div>
        ))}
        {resources.length === 0 && (
          <div className="text-center py-8 text-white/30">
            Aucune ressource
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// PRACTICE CARD
// ============================================

interface PracticeCardProps {
  practice: SpiritualityPractice;
}

function PracticeCard({ practice }: PracticeCardProps) {
  const traditionColors: Record<string, string> = {
    neville: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    jungian: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    hermetic: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    stoic: 'from-slate-500/20 to-gray-500/20 border-slate-500/30',
    buddhist: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30',
    other: 'from-white/5 to-white/10 border-white/10',
  };

  return (
    <div className={`col-span-12 md:col-span-6 lg:col-span-4 p-5 rounded-2xl bg-gradient-to-br ${traditionColors[practice.tradition]} border backdrop-blur-sm`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-white font-light">{practice.title}</h4>
        {practice.isFavorite && (
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
        )}
      </div>
      
      <p className="text-white/50 text-sm mb-4 line-clamp-2">{practice.description}</p>

      <div className="flex items-center gap-3 text-white/40 text-xs mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {practice.duration} min
        </span>
        <span>•</span>
        <span>{practice.frequency}</span>
      </div>

      {/* Instructions Preview */}
      <div className="space-y-1">
        {practice.instructions.slice(0, 2).map((instruction, i) => (
          <div key={i} className="flex items-start gap-2 text-white/40 text-xs">
            <span className="text-white/30">{i + 1}.</span>
            <span className="line-clamp-1">{instruction}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 mt-4">
        {practice.benefits.slice(0, 2).map((benefit) => (
          <span key={benefit} className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-[10px]">
            {benefit}
          </span>
        ))}
      </div>
    </div>
  );
}

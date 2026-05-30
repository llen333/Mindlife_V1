// SpiritPage Constants
import { Brain, Heart, Target } from 'lucide-react';
import type { Archetype, Frequency, SpiritCard, SpiritNote, OdyseeStep, Quote } from './types';

// Archetypes data
export const archetypes: Archetype[] = [
  { id: 'psychologue', name: 'Le Psychologue', icon: Brain, description: 'Analyse & Compréhension' },
  { id: 'ami', name: "L'Ami", icon: Heart, description: 'Écoute & Bienveillance' },
  { id: 'stoicien', name: 'Le Stoïcien', icon: Target, description: 'Sagesse & Discipline' },
];

// Welcome messages for each archetype
export const archetypeWelcomeMessages: Record<string, string> = {
  psychologue: '"Bienvenue dans cet espace de contemplation. Je suis là pour t\'écouter et t\'aider à explorer tes pensées en profondeur. Qu\'est-ce qui t\'amène aujourd\'hui ?"',
  ami: '"Salut ! Je suis content d\'être là pour toi. Parle-moi de ce qui te tracasse ou de ce qui te fait vibrer. Je t\'écoute avec le cœur."',
  stoicien: '"Considère que tout ce qui t\'arrive est nécessaire à l\'harmonie du Tout. Quelle pensée occupe ton esprit en cet instant ?"',
};

// Sample data
export const initialFrequencies: Frequency[] = [
  { id: '1', name: "Expansion de l'Être", hz: '528 Hz', description: 'Miracles', isPlaying: false },
  { id: '2', name: 'Harmonie Terrestre', hz: '432 Hz', description: 'Résonance', isPlaying: false },
  { id: '3', name: 'Connexion Universelle', hz: '639 Hz', description: 'Relations', isPlaying: false },
];

export const initialCards: SpiritCard[] = [
  { id: '1', title: 'Lecture des Lettres à Lucilius', status: 'gestation', progress: 0, icon: 'book', category: 'Âme' },
  { id: '2', title: 'Pratique du silence 15min', status: 'floraison', progress: 66, icon: 'meditation', category: 'Quotidien' },
  { id: '3', title: 'Méditation matinale', status: 'ancree', progress: 100, icon: 'sun', category: 'Validé' },
];

export const initialNotes: SpiritNote[] = [
  { id: '1', content: "L'aube de ce matin m'a rappelé la fragilité de nos intentions face à l'immensité du temps.", tag: 'Éveil', type: 'text', createdAt: new Date() },
  { id: '2', content: "La contemplation est une forme d'action silencieuse qui répare le monde intérieur.", tag: 'Silence', type: 'text', createdAt: new Date() },
  { id: '3', content: "Pourquoi cherchons-nous la validation à l'extérieur quand la source est au centre ?", tag: 'Centrage', type: 'text', createdAt: new Date() },
  { id: '4', content: 'Structure pour le prochain sanctuaire visuel.', tag: 'Vision', type: 'vision', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', createdAt: new Date() },
];

export const odyseeSteps: OdyseeStep[] = [
  { id: '1', title: 'Éveil', status: 'completed' },
  { id: '2', title: 'Discipline Stoïcienne', status: 'current' },
  { id: '3', title: 'Harmonie Intérieure', status: 'upcoming' },
];

export const quotes: Quote[] = [
  { id: '1', author: 'Marc Aurèle', content: '"Ce qui ne transmet pas la lumière ne peut pas être un miroir."', type: 'resonance' },
  { id: '2', author: 'Épictète', content: '"Le bonheur ne consiste pas à acquérir et à jouir, mais à ne rien désirer."', type: 'philosophy' },
];

export const waveHeights = [40, 70, 100, 60, 85, 45, 90, 55, 65, 50, 80, 40, 70];

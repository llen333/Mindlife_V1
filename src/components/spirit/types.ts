// SpiritPage Types

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  archetype?: string;
  timestamp: Date;
}

export interface SpiritCard {
  id: string;
  title: string;
  status: 'gestation' | 'floraison' | 'ancree';
  progress: number;
  icon: string;
  category: string;
}

export interface SpiritNote {
  id: string;
  content: string;
  tag: string;
  type: 'text' | 'vision';
  imageUrl?: string;
  createdAt: Date;
}

export interface OdyseeStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface Frequency {
  id: string;
  name: string;
  hz: string;
  description: string;
  isPlaying: boolean;
}

export interface Quote {
  id: string;
  author: string;
  content: string;
  type: 'resonance' | 'philosophy';
}

export interface Archetype {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export interface SavedConversation {
  id: string;
  archetype: string;
  messages: ChatMessage[];
  createdAt: string;
  messageCount: number;
}

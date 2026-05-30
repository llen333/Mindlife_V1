// GrowthPage Types - Développement Personnel Complet

// ============================================
// SECTION 1: ÉVOLUTIONS ET ROUTINES
// ============================================

export interface GrowthRoutine {
  id: string;
  title: string;
  description: string;
  category: 'morning' | 'evening' | 'custom';
  frequency: 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[]; // 0-6
  timeOfDay?: string; // HH:mm
  duration: number; // minutes
  steps: RoutineStep[];
  isActive: boolean;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  lastCompletedAt?: Date;
  icon: string;
  color: string;
  thumbnail?: string;
}

export interface RoutineStep {
  id: string;
  title: string;
  description?: string;
  duration?: number; // minutes
  order: number;
  isCompleted: boolean;
}

export interface GrowthGoal {
  id: string;
  title: string;
  description: string;
  category: GrowthCategory;
  type: 'outcome' | 'process' | 'identity';
  philosophy: 'compound' | 'atomic' | 'jim-rohn' | 'neville' | 'none';
  targetValue?: number;
  currentValue: number;
  unit?: string;
  milestones: Milestone[];
  identityStatement?: string;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  progress: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
  order: number;
}

export type GrowthCategory = 
  | 'health' 
  | 'mind' 
  | 'productivity' 
  | 'learning' 
  | 'relationships' 
  | 'finance' 
  | 'spirit' 
  | 'creativity'
  | 'professional';

// ============================================
// SECTION 2: DÉVELOPPEMENT PERSONNEL
// ============================================

export interface PersonalResource {
  id: string;
  title: string;
  author?: string;
  type: 'book' | 'video' | 'article' | 'audio' | 'course';
  status: 'to-read' | 'reading' | 'completed' | 'to-watch' | 'watching' | 'to-listen' | 'listening';
  category: 'mindset' | 'productivity' | 'relationships' | 'health' | 'spirituality' | 'finance';
  imageUrl?: string;
  url?: string;
  description?: string;
  notes?: string;
  rating?: number; // 1-5
  progress: number; // 0-100
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface RoutineSchedule {
  id: string;
  routineId: string;
  routine: GrowthRoutine;
  scheduledDate: Date;
  scheduledTime: string;
  isCompleted: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface EvolutionCurve {
  id: string;
  date: Date;
  category: GrowthCategory;
  score: number; // 1-10
  notes?: string;
}

// ============================================
// SECTION 3: DÉVELOPPEMENT PROFESSIONNEL
// ============================================

export interface ProfessionalProject {
  id: string;
  title: string;
  description: string;
  type: 'business' | 'side-project' | 'investment' | 'skill';
  status: 'idea' | 'planning' | 'active' | 'paused' | 'completed';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  spent?: number;
  roi?: number;
  tags: string[];
}

export interface TechWatch {
  id: string;
  title: string;
  source: string;
  url?: string;
  summary: string;
  category: string;
  relevance: 'low' | 'medium' | 'high';
  status: 'new' | 'read' | 'archived';
  createdAt: Date;
}

export interface ProfessionalContact {
  id: string;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
  tags: string[];
  lastContact?: Date;
  nextFollowUp?: Date;
}

export interface BusinessCost {
  id: string;
  title: string;
  amount: number;
  category: 'fixed' | 'variable' | 'investment';
  frequency: 'one-time' | 'monthly' | 'yearly';
  date: Date;
  notes?: string;
}

export interface DailyActivityLog {
  id: string;
  date: Date;
  activities: ActivityEntry[];
  mood: number; // 1-5
  productivity: number; // 1-10
  wins: string[];
  challenges: string[];
  notes?: string;
}

export interface ActivityEntry {
  id: string;
  title: string;
  duration: number; // minutes
  category: string;
  projectId?: string;
}

// ============================================
// SECTION 4: DÉVELOPPEMENT PSYCHÉ
// ============================================

export interface PsycheResource {
  id: string;
  title: string;
  author: string;
  type: 'book' | 'video' | 'article' | 'audio' | 'practice';
  source?: 'neville-goddard' | 'carl-jung' | 'synchronicity' | 'hermes' | 'thot' | 'other';
  url?: string;
  imageUrl?: string;
  description?: string;
  status?: 'to-explore' | 'exploring' | 'integrated';
  rating?: number;
  notes?: string;
  keyConcepts: string[];
  practiceInstructions?: string[];
}

export interface MentalCard {
  id: string;
  front: string; // Question or concept
  back: string; // Answer or explanation
  category: 'concept' | 'practice' | 'quote' | 'affirmation';
  source?: string;
  masteryLevel?: number; // 0-100
  lastReviewed?: Date;
  reviewCount?: number;
}

export interface SpiritualityPractice {
  id: string;
  title: string;
  description: string;
  tradition: 'hermetic' | 'jungian' | 'neville' | 'stoic' | 'buddhist' | 'other';
  duration: number; // minutes
  frequency: string;
  instructions: string[];
  benefits: string[];
  isFavorite: boolean;
}

// ============================================
// UI TYPES
// ============================================

export interface GrowthModalProps {
  isVisible: boolean;
  onClose: () => void;
  data?: unknown;
  onSave?: (data: unknown) => void;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  action?: React.ReactNode;
}

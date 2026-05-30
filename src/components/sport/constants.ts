// SportPage Constants
import type { Exercise, WeeklyProgram } from './types';

// Noms des jours de la semaine
export const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Images optimisées pour chaque type de workout
export const workoutImages: Record<string, string> = {
  'POUSSÉE FORCE': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&q=60',
  'TIRAGE FORCE': 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=200&q=60',
  'JAMBES VOLUME': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=200&q=60',
  'ÉPAULES / ABS': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=60',
  'BRAS DENSITÉ': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&q=60',
  'CARDIO HIIT': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=200&q=60',
  'REPOS': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&q=60',
};

// Images spécifiques pour chaque exercice
export const exerciseImages: Record<string, string> = {
  // Poussée
  'Développé Couché': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=60',
  'Développé Incliné': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=60',
  'Dips': 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=300&q=60',
  'Écartés Halteres': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=60',
  // Tirage
  'Tractions': 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=300&q=60',
  'Rowing Barre': 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=300&q=60',
  'Face Pull': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=60',
  'Curl Biceps': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=60',
  // Jambes
  'Squat': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=300&q=60',
  'Leg Press': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=300&q=60',
  'Fentes': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=300&q=60',
  'Leg Curl': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=300&q=60',
  // Épaules
  'Développé Épaules': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=60',
  'Élévations Latérales': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=60',
  'Crunch': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=60',
  'Planche': 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=300&q=60',
  // Bras
  'Curl Marteau': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=60',
  'Extension Triceps': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=60',
  'Curl Concentration': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=60',
  // Cardio
  'Burpees': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=300&q=60',
  'Jump Squat': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=300&q=60',
  'Mountain Climbers': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=300&q=60',
  // Échauffement/Récupération
  'Échauffement': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&q=60',
  'Mobilité': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&q=60',
  'Récupération': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=60',
  'Étirements': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=60',
};

// Exercices par type de séance
export const exercisesByWorkout: Record<string, { main: Exercise[], isolation: Exercise[], bonus: Exercise[], warmup: Exercise[], cooldown: Exercise[] }> = {
  'POUSSÉE FORCE': {
    main: [{ id: 'p1', name: 'Développé Couché', category: 'main', sets: 5, reps: '5', weight: 100, order: 1, completed: false }],
    isolation: [{ id: 'p2', name: 'Développé Incliné', category: 'isolation', sets: 4, reps: '8-10', weight: 70, order: 2, completed: false }],
    bonus: [{ id: 'p3', name: 'Dips', category: 'bonus', sets: 3, reps: '12', weight: null, order: 3, completed: false }],
    warmup: [{ id: 'pw', name: 'Rotations Épaules', category: 'warmup', sets: 1, reps: '5 min', weight: null, order: 0, completed: false }],
    cooldown: [{ id: 'pc', name: 'Étirements Pectoraux', category: 'cooldown', sets: 1, reps: '5 min', weight: null, order: 99, completed: false }],
  },
  'TIRAGE FORCE': {
    main: [{ id: 't1', name: 'Tractions', category: 'main', sets: 5, reps: '6', weight: null, order: 1, completed: false }],
    isolation: [{ id: 't2', name: 'Rowing Barre', category: 'isolation', sets: 4, reps: '8', weight: 80, order: 2, completed: false }],
    bonus: [{ id: 't3', name: 'Face Pull', category: 'bonus', sets: 3, reps: '15', weight: 25, order: 3, completed: false }],
    warmup: [{ id: 'tw', name: 'Circles Bras', category: 'warmup', sets: 1, reps: '5 min', weight: null, order: 0, completed: false }],
    cooldown: [{ id: 'tc', name: 'Étirements Dos', category: 'cooldown', sets: 1, reps: '5 min', weight: null, order: 99, completed: false }],
  },
  'JAMBES VOLUME': {
    main: [{ id: 'j1', name: 'Squat', category: 'main', sets: 5, reps: '8', weight: 120, order: 1, completed: false }],
    isolation: [{ id: 'j2', name: 'Leg Press', category: 'isolation', sets: 4, reps: '12', weight: 200, order: 2, completed: false }],
    bonus: [{ id: 'j3', name: 'Fentes', category: 'bonus', sets: 3, reps: '10/leg', weight: null, order: 3, completed: false }],
    warmup: [{ id: 'jw', name: 'Squat Poids Corps', category: 'warmup', sets: 1, reps: '5 min', weight: null, order: 0, completed: false }],
    cooldown: [{ id: 'jc', name: 'Étirements Jambes', category: 'cooldown', sets: 1, reps: '6 min', weight: null, order: 99, completed: false }],
  },
  'ÉPAULES / ABS': {
    main: [{ id: 'e1', name: 'Développé Épaules', category: 'main', sets: 5, reps: '6', weight: 50, order: 1, completed: false }],
    isolation: [{ id: 'e2', name: 'Élévations Latérales', category: 'isolation', sets: 4, reps: '12', weight: 12, order: 2, completed: false }],
    bonus: [{ id: 'e3', name: 'Crunch', category: 'bonus', sets: 3, reps: '20', weight: null, order: 3, completed: false }],
    warmup: [{ id: 'ew', name: 'Rotations Articulaires', category: 'warmup', sets: 1, reps: '5 min', weight: null, order: 0, completed: false }],
    cooldown: [{ id: 'ec', name: 'Planche', category: 'cooldown', sets: 1, reps: '60s', weight: null, order: 99, completed: false }],
  },
  'BRAS DENSITÉ': {
    main: [{ id: 'b1', name: 'Curl Biceps', category: 'main', sets: 4, reps: '10', weight: 20, order: 1, completed: false }],
    isolation: [{ id: 'b2', name: 'Extension Triceps', category: 'isolation', sets: 4, reps: '10', weight: 25, order: 2, completed: false }],
    bonus: [{ id: 'b3', name: 'Curl Marteau', category: 'bonus', sets: 3, reps: '12', weight: 15, order: 3, completed: false }],
    warmup: [{ id: 'bw', name: 'Pompees Légères', category: 'warmup', sets: 1, reps: '5 min', weight: null, order: 0, completed: false }],
    cooldown: [{ id: 'bc', name: 'Étirements Bras', category: 'cooldown', sets: 1, reps: '4 min', weight: null, order: 99, completed: false }],
  },
  'CARDIO HIIT': {
    main: [{ id: 'c1', name: 'Burpees', category: 'main', sets: 4, reps: '10', weight: null, order: 1, completed: false }],
    isolation: [{ id: 'c2', name: 'Jump Squat', category: 'isolation', sets: 4, reps: '15', weight: null, order: 2, completed: false }],
    bonus: [{ id: 'c3', name: 'Mountain Climbers', category: 'bonus', sets: 3, reps: '30s', weight: null, order: 3, completed: false }],
    warmup: [{ id: 'cw', name: 'Corde à Sauter', category: 'warmup', sets: 1, reps: '5 min', weight: null, order: 0, completed: false }],
    cooldown: [{ id: 'cc', name: 'Marche Lente', category: 'cooldown', sets: 1, reps: '5 min', weight: null, order: 99, completed: false }],
  },
  'REPOS': {
    main: [],
    isolation: [],
    bonus: [],
    warmup: [{ id: 'rw', name: 'Marche Légère', category: 'warmup', sets: 1, reps: '15 min', weight: null, order: 0, completed: false }],
    cooldown: [{ id: 'rc', name: 'Étirements Complets', category: 'cooldown', sets: 1, reps: '20 min', weight: null, order: 99, completed: false }],
  },
};

// Types de workout par jour de la semaine (0 = Lundi, 6 = Dimanche)
export const workoutByDay: Record<number, string> = {
  0: 'POUSSÉE FORCE',
  1: 'TIRAGE FORCE',
  2: 'JAMBES VOLUME',
  3: 'ÉPAULES / ABS',
  4: 'BRAS DENSITÉ',
  5: 'CARDIO HIIT',
  6: 'REPOS',
};

// Mobilité spécifique selon le type de workout
export const mobilityByWorkout: Record<string, { name: string; duration: string }> = {
  'POUSSÉE FORCE': { name: 'Mobilité Épaules', duration: '8 min' },
  'TIRAGE FORCE': { name: 'Mobilité Dos', duration: '8 min' },
  'JAMBES VOLUME': { name: 'Mobilité Hanches', duration: '10 min' },
  'ÉPAULES / ABS': { name: 'Mobilité Colonne', duration: '8 min' },
  'BRAS DENSITÉ': { name: 'Mobilité Coudes', duration: '6 min' },
  'CARDIO HIIT': { name: 'Étirements Dynamiques', duration: '8 min' },
  'REPOS': { name: 'Yoga Doux', duration: '20 min' },
};

// Labels des catégories d'exercices
export const categoryLabels: Record<string, string> = {
  'main': 'Exercice Principal',
  'isolation': 'Isolation',
  'bonus': 'Bonus Bio-Active'
};

// Programme par défaut
export const defaultProgram: WeeklyProgram = {
  id: 'default',
  name: 'Semaine en cours',
  weekNumber: 1,
  year: 2026,
  days: [
    { id: 'd1', dayOfWeek: 0, name: 'POUSSÉE FORCE', type: 'workout', intensity: 85, exercises: [] },
    { id: 'd2', dayOfWeek: 1, name: 'TIRAGE FORCE', type: 'workout', intensity: 75, exercises: [] },
    { id: 'd3', dayOfWeek: 2, name: 'JAMBES VOLUME', type: 'workout', intensity: 85, exercises: [] },
    { id: 'd4', dayOfWeek: 3, name: 'ÉPAULES / ABS', type: 'workout', intensity: 80, exercises: [] },
    { id: 'd5', dayOfWeek: 4, name: 'BRAS DENSITÉ', type: 'workout', intensity: 70, exercises: [] },
    { id: 'd6', dayOfWeek: 5, name: 'CARDIO HIIT', type: 'workout', intensity: 65, exercises: [] },
    { id: 'd7', dayOfWeek: 6, name: 'REPOS', type: 'rest', intensity: 0, exercises: [] },
  ]
};

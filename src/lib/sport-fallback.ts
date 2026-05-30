/**
 * Sport Fallback - Programmes et exercices sans API externe
 */

// ============================================
// TYPES
// ============================================

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string[];
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  description: string;
  sets?: number;
  reps?: string;
  rest?: string;
  tips?: string[];
}

interface WorkoutProgram {
  id: string;
  name: string;
  goal: string;
  level: 'débutant' | 'intermédiaire' | 'avancé';
  frequency: string; // ex: "3x/semaine"
  duration: string; // ex: "45 min"
  exercises: Exercise[];
  warmup?: string[];
  cooldown?: string[];
}

interface WeeklySchedule {
  day: string;
  workout: WorkoutProgram | null; // null = repos
  notes?: string;
}

// ============================================
// BANQUE D'EXERCICES
// ============================================

const EXERCISES: Record<string, Exercise[]> = {
  poitrine: [
    {
      id: 'push-up',
      name: 'Pompes',
      muscleGroup: 'poitrine',
      equipment: [],
      difficulty: 'débutant',
      description: 'Mains à largeur d\'épaules, descendre en gardant le corps aligné',
      sets: 3,
      reps: '10-15',
      rest: '60s',
      tips: ['Garder les coudes à 45°', 'Contracter les abdominaux'],
    },
    {
      id: 'bench-press',
      name: 'Développé Couché',
      muscleGroup: 'poitrine',
      equipment: ['barre', 'banc'],
      difficulty: 'intermédiaire',
      description: 'Allongé sur le banc, pousser la barre au-dessus de la poitrine',
      sets: 4,
      reps: '8-12',
      rest: '90s',
      tips: ['Contrôler la descente', 'Garder les pieds au sol'],
    },
    {
      id: 'incline-dumbbell-press',
      name: 'Développé Incliné Haltères',
      muscleGroup: 'poitrine',
      equipment: ['haltères', 'banc incliné'],
      difficulty: 'intermédiaire',
      description: 'Sur banc incliné à 30-45°, pousser les haltères au-dessus',
      sets: 3,
      reps: '10-12',
      rest: '60s',
    },
    {
      id: 'dips',
      name: 'Dips aux Barres',
      muscleGroup: 'poitrine',
      equipment: ['barres parallèles'],
      difficulty: 'intermédiaire',
      description: 'Penché en avant, descendre et remonter',
      sets: 3,
      reps: '8-12',
      rest: '60s',
      tips: ['Pencher le torse en avant pour cibler les pectoraux'],
    },
  ],
  
  dos: [
    {
      id: 'pull-up',
      name: 'Traction',
      muscleGroup: 'dos',
      equipment: ['barre de traction'],
      difficulty: 'intermédiaire',
      description: 'Suspendu à la barre, tirer le menton au-dessus',
      sets: 4,
      reps: '6-10',
      rest: '90s',
      tips: ['Contracter les omoplates en haut', 'Contrôler la descente'],
    },
    {
      id: 'bent-row',
      name: 'Rowing Barre',
      muscleGroup: 'dos',
      equipment: ['barre'],
      difficulty: 'intermédiaire',
      description: 'Penché vers l\'avant, tirer la barre vers le bas ventre',
      sets: 4,
      reps: '8-12',
      rest: '90s',
      tips: ['Garder le dos droit', 'Rentrer le ventre'],
    },
    {
      id: 'lat-pulldown',
      name: 'Tirage Poitrine',
      muscleGroup: 'dos',
      equipment: ['machine'],
      difficulty: 'débutant',
      description: 'Tirer la barre vers le haut de la poitrine',
      sets: 3,
      reps: '10-15',
      rest: '60s',
    },
    {
      id: 'deadlift',
      name: 'Soulevé de Terre',
      muscleGroup: 'dos',
      equipment: ['barre'],
      difficulty: 'avancé',
      description: 'Debout, barre au sol, soulever en gardant le dos droit',
      sets: 4,
      reps: '5-8',
      rest: '120s',
      tips: ['Dos impérativement droit', 'Pousser avec les jambes'],
    },
  ],
  
  jambes: [
    {
      id: 'squat',
      name: 'Squat',
      muscleGroup: 'jambes',
      equipment: [],
      difficulty: 'débutant',
      description: 'Descendre comme pour s\'asseoir, garder le dos droit',
      sets: 4,
      reps: '10-15',
      rest: '90s',
      tips: ['Genoux dans l\'axe des pieds', 'Descendre au moins parallèle'],
    },
    {
      id: 'leg-press',
      name: 'Presse à Cuisses',
      muscleGroup: 'jambes',
      equipment: ['machine'],
      difficulty: 'débutant',
      description: 'Pousser la plateforme avec les jambes',
      sets: 4,
      reps: '10-15',
      rest: '60s',
    },
    {
      id: 'lunge',
      name: 'Fentes',
      muscleGroup: 'jambes',
      equipment: [],
      difficulty: 'débutant',
      description: 'Un pas en avant, descendre le genou arrière',
      sets: 3,
      reps: '10 chaque jambe',
      rest: '60s',
    },
    {
      id: 'romanian-deadlift',
      name: 'Soulevé Roumain',
      muscleGroup: 'jambes',
      equipment: ['barre', 'haltères'],
      difficulty: 'intermédiaire',
      description: 'Jambes légèrement fléchies, descendre la barre en poussant les hanches',
      sets: 3,
      reps: '10-12',
      rest: '60s',
      tips: ['Sentir l\'étirement des ischios'],
    },
  ],
  
  epaules: [
    {
      id: 'overhead-press',
      name: 'Développé Épaules',
      muscleGroup: 'épaules',
      equipment: ['barre', 'haltères'],
      difficulty: 'intermédiaire',
      description: 'Pousser la charge au-dessus de la tête',
      sets: 3,
      reps: '8-12',
      rest: '60s',
      tips: ['Ne pas cambrer le dos'],
    },
    {
      id: 'lateral-raise',
      name: 'Élévations Latérales',
      muscleGroup: 'épaules',
      equipment: ['haltères'],
      difficulty: 'débutant',
      description: 'Lever les haltères sur le côté jusqu\'à hauteur d\'épaules',
      sets: 3,
      reps: '12-15',
      rest: '45s',
      tips: ['Légèrement penché en avant', 'Petit mouvement'],
    },
    {
      id: 'face-pull',
      name: 'Face Pull',
      muscleGroup: 'épaules',
      equipment: ['poulie', 'corde'],
      difficulty: 'intermédiaire',
      description: 'Tirer la corde vers le visage en écartant les bras',
      sets: 3,
      reps: '15-20',
      rest: '45s',
    },
  ],
  
  bras: [
    {
      id: 'bicep-curl',
      name: 'Curl Biceps',
      muscleGroup: 'bras',
      equipment: ['haltères', 'barre'],
      difficulty: 'débutant',
      description: 'Fléchir les coudes pour amener les poids aux épaules',
      sets: 3,
      reps: '10-15',
      rest: '45s',
      tips: ['Ne pas balancer', 'Garder les coudes fixes'],
    },
    {
      id: 'tricep-pushdown',
      name: 'Extension Triceps Poulie',
      muscleGroup: 'bras',
      equipment: ['poulie'],
      difficulty: 'débutant',
      description: 'Pousser la barre vers le bas en étendant les bras',
      sets: 3,
      reps: '12-15',
      rest: '45s',
    },
    {
      id: 'hammer-curl',
      name: 'Curl Marteau',
      muscleGroup: 'bras',
      equipment: ['haltères'],
      difficulty: 'débutant',
      description: 'Curl avec les paumes face à face',
      sets: 3,
      reps: '10-12',
      rest: '45s',
    },
  ],
  
  abdos: [
    {
      id: 'plank',
      name: 'Planche',
      muscleGroup: 'abdos',
      equipment: [],
      difficulty: 'débutant',
      description: 'En appui sur les avant-bras, corps aligné',
      sets: 3,
      reps: '30-60s',
      rest: '30s',
      tips: ['Rentrer le ventre', 'Ne pas cambrer'],
    },
    {
      id: 'crunch',
      name: 'Crunch',
      muscleGroup: 'abdos',
      equipment: [],
      difficulty: 'débutant',
      description: 'Allongé, remonter les épaules en roulant le dos',
      sets: 3,
      reps: '15-20',
      rest: '30s',
    },
    {
      id: 'leg-raise',
      name: 'Relevé de Jambes',
      muscleGroup: 'abdos',
      equipment: [],
      difficulty: 'intermédiaire',
      description: 'Allongé, lever les jambes jusqu\'à 90°',
      sets: 3,
      reps: '12-15',
      rest: '45s',
    },
    {
      id: 'russian-twist',
      name: 'Russian Twist',
      muscleGroup: 'abdos',
      equipment: ['haltère', 'medecine ball'],
      difficulty: 'intermédiaire',
      description: 'Assis, tourner le torse d\'un côté puis de l\'autre',
      sets: 3,
      reps: '20 total',
      rest: '30s',
    },
  ],
};

// ============================================
// PROGRAMMES D'ENTRAÎNEMENT
// ============================================

const WORKOUT_PROGRAMS: WorkoutProgram[] = [
  // FULL BODY - Débutant
  {
    id: 'full-body-beginner',
    name: 'Full Body Débutant',
    goal: 'Renforcement général',
    level: 'débutant',
    frequency: '3x/semaine',
    duration: '45 min',
    warmup: [
      '5 min cardio léger (marche, vélo)',
      'Cercles d\'épaules x10',
      'Rotations de hanches x10',
    ],
    exercises: [
      EXERCISES.poitrine[0], // Pompes
      EXERCISES.dos[2], // Tirage poitrine
      EXERCISES.jambes[0], // Squat
      EXERCISES.epaules[1], // Élévations latérales
      EXERCISES.bras[0], // Curl biceps
      EXERCISES.abdos[0], // Planche
    ],
    cooldown: [
      'Étirements poitrine 30s',
      'Étirements quadriceps 30s',
      'Étirements dos 30s',
    ],
  },
  
  // PUSH PULL LEGS - Intermédiaire
  {
    id: 'push-intermediate',
    name: 'Push Day (Push/Pull/Legs)',
    goal: 'Hypertrophie haut du corps',
    level: 'intermédiaire',
    frequency: '1x/3 jours (rotation)',
    duration: '60 min',
    warmup: [
      '5 min rameur ou elliptique',
      'Rotations d\'épaules avec élastique',
      'Pompes légères x10',
    ],
    exercises: [
      EXERCISES.poitrine[1], // Développé couché
      EXERCISES.poitrine[2], // Développé incliné
      EXERCISES.epaules[0], // Développé épaules
      EXERCISES.epaules[1], // Élévations latérales
      EXERCISES.bras[1], // Extension triceps
      EXERCISES.poitrine[3], // Dips
    ],
    cooldown: [
      'Étirements pectoraux 30s',
      'Étirements épaules 30s',
      'Étirements triceps 30s',
    ],
  },
  
  {
    id: 'pull-intermediate',
    name: 'Pull Day (Push/Pull/Legs)',
    goal: 'Hypertrophie dos et biceps',
    level: 'intermédiaire',
    frequency: '1x/3 jours (rotation)',
    duration: '60 min',
    warmup: [
      '5 min rameur',
      'Cercles de bras',
      'Traction assistée x5',
    ],
    exercises: [
      EXERCISES.dos[0], // Tractions
      EXERCISES.dos[1], // Rowing barre
      EXERCISES.dos[3], // Soulevé de terre
      EXERCISES.epaules[2], // Face pull
      EXERCISES.bras[0], // Curl biceps
      EXERCISES.bras[2], // Curl marteau
    ],
    cooldown: [
      'Étirements grand dorsal 30s',
      'Étirements biceps 30s',
    ],
  },
  
  {
    id: 'legs-intermediate',
    name: 'Leg Day',
    goal: 'Force et hypertrophie jambes',
    level: 'intermédiaire',
    frequency: '1x/3 jours (rotation)',
    duration: '60 min',
    warmup: [
      '5 min vélo',
      'Squats au poids de corps x15',
      'Fentes dynamiques x10',
    ],
    exercises: [
      EXERCISES.jambes[0], // Squat
      EXERCISES.jambes[1], // Presse à cuisses
      EXERCISES.jambes[3], // Soulevé roumain
      EXERCISES.jambes[2], // Fentes
      EXERCISES.abdos[2], // Relevé de jambes
      EXERCISES.abdos[0], // Planche
    ],
    cooldown: [
      'Étirements quadriceps 30s',
      'Étirements ischios 30s',
      'Étirements mollets 30s',
    ],
  },
  
  // HIIT - Cardio
  {
    id: 'hiit-cardio',
    name: 'HIIT Cardio',
    goal: 'Endurance et brûle graisse',
    level: 'intermédiaire',
    frequency: '2-3x/semaine',
    duration: '25 min',
    warmup: [
      '3 min jogging sur place',
      'Jumping jacks x20',
      'Mountain climbers x10',
    ],
    exercises: [
      { ...EXERCISES.jambes[0], name: 'Squat Jump', reps: '30s' },
      { ...EXERCISES.poitrine[0], name: 'Burpees', reps: '30s' },
      { ...EXERCISES.jambes[2], name: 'Jump Lunges', reps: '30s' },
      { ...EXERCISES.abdos[3], name: 'Mountain Climbers', reps: '30s' },
      { name: 'Burpees', id: 'burpees', muscleGroup: 'full body', equipment: [], difficulty: 'intermédiaire', description: 'Squat + saut + planche', reps: '30s' },
    ],
    cooldown: [
      'Marche lente 2 min',
      'Respiration profonde 1 min',
    ],
  },
];

// ============================================
// GÉNÉRATEURS
// ============================================

export function getExercisesByMuscle(muscle: string): Exercise[] {
  const muscleLower = muscle.toLowerCase();
  
  for (const [group, exercises] of Object.entries(EXERCISES)) {
    if (group.includes(muscleLower) || muscleLower.includes(group)) {
      return exercises;
    }
  }
  
  // Retourner un mélange si pas trouvé
  return Object.values(EXERCISES).flat().slice(0, 5);
}

export function getWorkoutProgram(level: string = 'intermédiaire'): WorkoutProgram {
  const levelMap: Record<string, 'débutant' | 'intermédiaire' | 'avancé'> = {
    'debutant': 'débutant',
    'débutant': 'débutant',
    'beginner': 'débutant',
    'intermediaire': 'intermédiaire',
    'intermédiaire': 'intermédiaire',
    'intermediate': 'intermédiaire',
    'avance': 'avancé',
    'avancé': 'avancé',
    'advanced': 'avancé',
  };
  
  const targetLevel = levelMap[level.toLowerCase()] || 'intermédiaire';
  
  const matching = WORKOUT_PROGRAMS.filter(p => p.level === targetLevel);
  return matching[Math.floor(Math.random() * matching.length)] || WORKOUT_PROGRAMS[0];
}

export function getWeeklyProgram(goal: string = 'general'): WeeklySchedule[] {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  const schedules: WeeklySchedule[] = [
    { day: 'Lundi', workout: WORKOUT_PROGRAMS.find(p => p.id === 'push-intermediate') || null },
    { day: 'Mardi', workout: WORKOUT_PROGRAMS.find(p => p.id === 'pull-intermediate') || null },
    { day: 'Mercredi', workout: null, notes: 'Repos actif : marche, stretching' },
    { day: 'Jeudi', workout: WORKOUT_PROGRAMS.find(p => p.id === 'legs-intermediate') || null },
    { day: 'Vendredi', workout: WORKOUT_PROGRAMS.find(p => p.id === 'hiit-cardio') || null },
    { day: 'Samedi', workout: WORKOUT_PROGRAMS.find(p => p.id === 'full-body-beginner') || null },
    { day: 'Dimanche', workout: null, notes: 'Repos complet' },
  ];
  
  return schedules;
}

export function generateQuickWorkout(duration: number = 30): WorkoutProgram {
  // Génère un workout rapide basé sur la durée
  const allExercises = Object.values(EXERCISES).flat();
  const numExercises = Math.floor(duration / 5); // ~5 min par exercice
  
  const selected = [];
  const usedGroups = new Set<string>();
  
  while (selected.length < numExercises && selected.length < allExercises.length) {
    const exercise = allExercises[Math.floor(Math.random() * allExercises.length)];
    if (!usedGroups.has(exercise.muscleGroup) || selected.length >= Object.keys(EXERCISES).length) {
      selected.push(exercise);
      usedGroups.add(exercise.muscleGroup);
    }
  }
  
  return {
    id: 'quick-workout',
    name: `Workout Express ${duration} min`,
    goal: 'Entraînement complet rapide',
    level: 'intermédiaire',
    frequency: 'à la demande',
    duration: `${duration} min`,
    warmup: ['3 min cardio léger', 'Cercles articulaires'],
    exercises: selected,
    cooldown: ['Étirements 3 min'],
  };
}

// ============================================
// CONSEILS SPORT
// ============================================

const SPORT_TIPS = [
  {
    topic: 'motivation',
    tips: [
      "Fixe-toi des objectifs SMART : Spécifiques, Mesurables, Atteignables, Réalistes, Temporels.",
      "Trouve un partenaire d'entraînement pour plus de motivation.",
      "Note tes progrès dans un carnet pour visualiser tes avancées.",
    ],
  },
  {
    topic: 'récupération',
    tips: [
      "Dors au moins 7-8h par nuit pour optimiser la récupération musculaire.",
      "Prends 48h de repos entre deux séances du même groupe musculaire.",
      "L'étirement post-entraînement réduit les courbatures.",
    ],
  },
  {
    topic: 'progression',
    tips: [
      "Augmente progressivement la charge : +2.5% par semaine maximum.",
      "La technique avant le poids. Un mouvement mal exécuté est inutile voire dangereux.",
      "Varie tes exercices tous les 4-6 semaines pour éviter la stagnation.",
    ],
  },
  {
    topic: 'nutrition',
    tips: [
      "Mange des protéines dans l'heure suivant ton entraînement.",
      "Hydrate-toi avant, pendant et après l'effort.",
      "Les glucides sont ton carburant : ne les néglige pas.",
    ],
  },
];

export function getSportAdvice(topic: string): string {
  const lowerTopic = topic.toLowerCase();
  
  for (const item of SPORT_TIPS) {
    if (lowerTopic.includes(item.topic) || item.topic.includes(lowerTopic)) {
      return item.tips[Math.floor(Math.random() * item.tips.length)];
    }
  }
  
  return SPORT_TIPS[Math.floor(Math.random() * SPORT_TIPS.length)].tips[0];
}

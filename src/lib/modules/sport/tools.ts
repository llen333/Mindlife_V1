import { db } from '@/lib/db';

interface ExecuteCtx { userId: string }

export const SPORT_TOOLS = {
  log_sport_session: {
    name: 'log_sport_session',
    description: "Enregistrer une séance de sport. Crée automatiquement un profil sport si nécessaire.",
    execute: async (args: Record<string, any>, { userId }: ExecuteCtx) => {
      let { name, duration, intensity, notes, date } = args;

      if ((!name || !duration) && args.query) {
        const q = args.query;
        const durMatch = q.match(/(\d+)\s*(min|minutes)|(\d+)\s*h(?:eure)?s?(?:\s*(\d+))?/i);
        if (durMatch) {
          if (durMatch[2] === 'min' || durMatch[2] === 'minutes') {
            duration = parseInt(durMatch[1]);
          } else {
            const h = parseInt(durMatch[3]);
            const m = parseInt(durMatch[4] || '0');
            duration = h * 60 + m;
          }
        }
        name = q.replace(/(\d+)\s*(min|minutes)|(\d+)\s*h(?:eure)?s?(?:\s*(\d+))?/gi, '')
          .replace(/log.*sport|ajoute.*séance|sport|entraînement|entrainement/i, '')
          .trim() || 'Sport';
      }

      let profile = await db.sportProfile.findFirst({ where: { userId } });
      if (!profile) {
        profile = await db.sportProfile.create({
          data: { id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, userId, level: 'intermédiaire', goals: '[]', preferredSports: '[]' },
        });
      }
      const session = await db.workoutSession.create({
        data: {
          id: `sport-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          profileId: profile.id,
          name,
          date: date ? new Date(date) : new Date(),
          duration,
          intensity: intensity || null,
          notes: notes || null,
          status: 'completed',
        },
      });
      return `🏋️ Séance enregistrée : "${session.name}" — ${duration}min${intensity ? `, intensité ${intensity}/10` : ''}`;
    },
  },

  workout_generator: {
    name: 'workout_generator',
    description: "Génère un programme d'entraînement personnalisé basé sur les objectifs, le niveau et les équipements disponibles.",
    execute: async (args: Record<string, any>, { userId }: ExecuteCtx) => {
      const { goal, level = 'intermédiaire', duration = 45, equipment = 'minimal', focusArea } = args;

      try {
        const workout = await generatePersonalizedWorkout({ goal, level, duration, equipment, focusArea, userId });

        return `
💪 **Programme d'entraînement ${goal} - ${level}**

⏱️ Durée : ${duration} minutes
🏋️ Équipement : ${equipment}
${focusArea ? `🎯 Zone : ${focusArea}` : ''}

${workout}

*Généré spécialement pour vous par votre coach personnel Atlas !*`;
      } catch (error) {
        return `❌ Impossible de générer votre programme : ${error}`;
      }
    },
  },
};

async function generatePersonalizedWorkout(params: any): Promise<string> {
  const { goal, level, duration } = params;

  const exercisesByGoal: Record<string, string[]> = {
    force: ['Développé couché', 'Tractions', 'Squat', 'Soulevé de terre'],
    endurance: ['Course à pied', 'Vélo', 'Natation', 'Burpees'],
    musculation: ['Presse à cuisse', 'Curl biceps', 'Élévations latérales', 'Crunchs'],
    'perte de poids': ['Jumping jacks', 'Mountain climbers', 'Fentes marchées', 'Rameur'],
    santé: ['Marche rapide', 'Étirements', 'Yoga simple', 'Respiration contrôlée']
  };

  const exercises = exercisesByGoal[goal] || exercisesByGoal.musculation;

  const workout = `
**Série d'échauffement (10 min) :**
- Marche rapide 5 min
- Étirements dynamiques 5 min

**Exercices principaux (${Number(duration) - 20} min) :**
${exercises.slice(0, 4).map((ex, i) => `${i + 1}. ${ex} - 3 séries de ${level === 'débutant' ? '10' : level === 'avancé' ? '15' : '12'} répétitions`).join('\n')}

**Série de récupération (10 min) :**
- Respiration profonde
- Étirements légers

*Intensité adaptée à votre niveau ${level}.*
`;

  return workout;
}

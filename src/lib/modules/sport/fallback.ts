import { getWorkoutProgram, getSportAdvice, generateQuickWorkout, getExercisesByMuscle, getWeeklyProgram } from '@/lib/sport-fallback';

export const FALLBACK = {
  getProgram(level: string): string {
    const program = getWorkoutProgram(level);
    return `🏋️ **${program.name}**\n\n🎯 Objectif: ${program.goal}\n📊 Niveau: ${program.level}\n⏱️ Durée: ${program.duration}\n📅 Fréquence: ${program.frequency}\n\n${program.exercises.map(e => `• ${e.name} (${e.reps})`).join('\n')}`;
  },

  getQuickWorkout(duration: number = 30): string {
    const workout = generateQuickWorkout(duration);
    const exerciseList = workout.exercises.map(e => `• ${e.name} (${e.reps})`).join('\n');
    return `⚡ **${workout.name}**\n\n${exerciseList}\n\n💡 N'oublie pas de t'échauffer 3 min avant !`;
  },

  getAdvice(topic: string): string {
    return getSportAdvice(topic);
  },

  getWeekly(goal: string): string {
    const schedule = getWeeklyProgram(goal);
    const lines = schedule.map(d => {
      if (!d.workout) return `• **${d.day}** — ${d.notes || 'Repos'}`;
      return `• **${d.day}** — ${d.workout.name} (${d.workout.duration})`;
    });
    return `📅 **Programme hebdomadaire**\n\n${lines.join('\n')}`;
  },

  getExercisesByMuscle(muscle: string): string {
    const exercises = getExercisesByMuscle(muscle);
    if (exercises.length === 0) return `😕 Aucun exercice trouvé pour "${muscle}".`;
    return `🏋️ **Exercices pour ${muscle}**\n\n${exercises.map(e => `• ${e.name} (${e.difficulty}) — ${e.reps || e.description}`).join('\n')}`;
  },
};

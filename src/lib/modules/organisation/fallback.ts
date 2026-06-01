export const FALLBACK = {
  noConnection: () => `📋 Mode hors-ligne — je ne peux pas créer d'événements pour le moment.
En attendant, note ce que tu veux planifier et je le ferai dès que possible.`,

  getAdvice: (topic: string) => {
    const tips: Record<string, string> = {
      organisation: 'La matrice d\'Eisenhower peut t\'aider : urgent/important en premier, le reste se planifie.',
      productivite: 'Essaie la technique Pomodoro : 25min focus, 5min pause. Efficacité garantie.',
      priorites: 'Chaque soir, note tes 3 priorités du lendemain. Ton cerveau travaille dessus pendant la nuit.',
    };
    return tips[topic] || tips.organisation;
  },
};

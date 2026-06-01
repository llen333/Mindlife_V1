export const DONNEES_FALLBACKS: Record<string, string> = {
  save_note: `📝 **Mode hors-ligne** — Je ne peux pas sauvegarder la note pour l'instant. Elle sera perdue si tu ne la notes pas ailleurs.

Tu peux :
• Noter dans un fichier texte en attendant
• Réessayer plus tard`,
  get_notes: `📝 **Mode hors-ligne** — Je ne peux pas accéder à tes notes sauvegardées pour l'instant.

Réessaie quand tu auras une connexion.`,
  log_weight: `⚖️ **Mode hors-ligne** — Je ne peux pas enregistrer le poids pour l'instant.

Note-le quelque part et je le mettrai à jour plus tard.`,
  log_sleep: `😴 **Mode hors-ligne** — Je ne peux pas enregistrer le sommeil pour l'instant.

Note tes heures de coucher/réveil pour les reporter plus tard.`,
};

export function getFallback(intent: string): string {
  return DONNEES_FALLBACKS[intent] || "📊 Service indisponible pour l'instant. Réessaie plus tard.";
}

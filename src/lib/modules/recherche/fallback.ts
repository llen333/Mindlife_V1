export const RECHERCHE_FALLBACKS: Record<string, string> = {
  web_search: `🌐 **Mode hors-ligne** — Je ne peux pas chercher sur le web pour l'instant.

Voici quelques alternatives :
• Réessaie plus tard quand tu auras une connexion
• Consulte tes notes sauvegardées dans Mindlife
• Je peux t'aider avec d'autres choses (alimentation, organisation, etc.)`,
  scrape_url: `📄 **Mode hors-ligne** — Je ne peux pas accéder à cette page pour l'instant.

Essaie de :
• Réessayer plus tard
• Me demander une recherche générale à la place
• Consulter une source que j'ai déjà en mémoire`,
};

export function getFallback(intent: string): string {
  return RECHERCHE_FALLBACKS[intent] || RECHERCHE_FALLBACKS.web_search;
}

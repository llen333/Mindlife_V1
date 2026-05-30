export interface SkillDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: 'base' | 'web' | 'data' | 'productivity' | 'creative';
}

export const ALL_SKILLS: Record<string, SkillDef> = {
  web_search: { id: 'web_search', label: 'Recherche Web', description: 'Chercher des informations sur Internet', icon: '🌐', category: 'web' },
  scrape_content: { id: 'scrape_content', label: 'Extraction Web', description: 'Extraire le contenu de pages web', icon: '📋', category: 'web' },
  scrape_recipes: { id: 'scrape_recipes', label: 'Recherche Recettes', description: 'Trouver des recettes sur Marmiton / 750g', icon: '🍳', category: 'web' },
  manage_events: { id: 'manage_events', label: 'Calendrier', description: 'Créer et gérer des événements / rendez-vous', icon: '📅', category: 'productivity' },
  manage_tasks: { id: 'manage_tasks', label: 'Tâches', description: 'Créer et gérer des tâches', icon: '📝', category: 'productivity' },
  manage_goals: { id: 'manage_goals', label: 'Objectifs', description: 'Créer et suivre des objectifs', icon: '🎯', category: 'productivity' },
  data_access: { id: 'data_access', label: 'Accès Données', description: 'Lire les données utilisateur (profil, poids, repas)', icon: '📊', category: 'data' },
  data_analysis: { id: 'data_analysis', label: 'Analyse', description: 'Analyser et synthétiser des données', icon: '📈', category: 'data' },
  memory_access: { id: 'memory_access', label: 'Mémoire', description: 'Accéder à la mémoire long terme de l\'agent', icon: '🧠', category: 'data' },
  writing: { id: 'writing', label: 'Rédaction', description: 'Rédiger des textes, rapports, contenu', icon: '✍️', category: 'creative' },
  code: { id: 'code', label: 'Code', description: 'Écrire et analyser du code', icon: '💻', category: 'creative' },
  images: { id: 'images', label: 'Images', description: 'Générer et analyser des images', icon: '🎨', category: 'creative' },
};

export const ROLE_BASE_SKILLS: Record<string, string[]> = {
  psychologist: ['conversation', 'analysis', 'reflection', 'spiritual_guidance', 'memory_access'],
  coach: ['training', 'nutrition', 'motivation', 'program_design', 'data_access'],
  nutrition: ['meal_planning', 'nutrition_advice', 'recipes', 'diet_tracking', 'scrape_recipes', 'data_access'],
  oracle: ['web_search', 'data_access', 'strategic_advice', 'decision_help'],
  organization: ['task_management', 'calendar', 'prioritization', 'workflow_optimization', 'manage_events', 'manage_tasks', 'manage_goals'],
  assistant: ['general_help', 'information', 'brainstorming', 'writing'],
};

export const ROLE_BASE_LABELS: Record<string, string[]> = {
  psychologist: ['Conversation', 'Analyse', 'Réflexion', 'Guidance spirituelle', 'Mémoire'],
  coach: ['Entraînement', 'Nutrition sportive', 'Motivation', 'Programmes', 'Données sport'],
  nutrition: ['Planification repas', 'Conseils nutrition', 'Recettes', 'Suivi diététique', 'Recherche recettes', 'Données nutrition'],
  oracle: ['Recherche web', 'Accès données', 'Conseil stratégique', 'Aide décision'],
  organization: ['Gestion tâches', 'Calendrier', 'Priorisation', 'Optimisation', 'Gestion événements', 'Gestion tâches', 'Gestion objectifs'],
  assistant: ['Aide générale', 'Information', 'Brainstorming', 'Rédaction'],
};

const EXTRA_SKILLS = Object.keys(ALL_SKILLS);

export function getOptionalSkills(role: string): string[] {
  const base = ROLE_BASE_SKILLS[role] || [];
  return EXTRA_SKILLS.filter(s => !base.includes(s));
}

export function skillLabel(id: string): string {
  return ALL_SKILLS[id]?.label || id.replace(/_/g, ' ');
}

export function skillDef(id: string): SkillDef | undefined {
  return ALL_SKILLS[id];
}

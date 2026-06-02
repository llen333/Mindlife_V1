import { BifrostDecision, DetectionMode } from './types';
import { bus } from '@/lib/bus/orchestrator';
import { registry } from '@/lib/bus/registry';
import { getEmbedding, cosineSimilarity } from '@/lib/rag/embeddings';

interface IntentPattern {
  moduleId: string;
  intent: string;
  patterns: RegExp[];
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    moduleId: 'nutrition',
    intent: 'recipe_search',
    patterns: [/recette|cuisiner|marmiton|750g|préparer.*plat|ingrédients? pour|faire (un|une|du|de la|des) .*gâteau|faire (un|une|du|de la|des) .*plat|faire (un|une|du|de la|des) .*recette/i],
  },
  {
    moduleId: 'nutrition',
    intent: 'meal_log',
    patterns: [/ajoute.*repas|ajoute.*plat|mangé|mange|j'ai pris|aujourd'hui.*mang|enregistre.*repas|log.*meal|save.*meal/i],
  },
  {
    moduleId: 'nutrition',
    intent: 'meal_plan',
    patterns: [/plan.*repas|plan.*alimentaire|menu.*semaine|menu.*jour|planifie.*repas|programme.*repas|planning.*repas/i],
  },
  {
    moduleId: 'nutrition',
    intent: 'meal_suggestion',
    patterns: [/proposition.*repas|suggère.*manger|quoi.*manger|conseil.*manger|idée.*repas/i],
  },
  {
    moduleId: 'nutrition',
    intent: 'meal_plan_complex',
    patterns: [/recette.*programmer|programmer.*recette|programmer.*demain.*soir|courses.*intelligente|shopping.*assistant|liste.*course.*ia/i],
  },
  {
    moduleId: 'sport',
    intent: 'workout_log',
    patterns: [/log.*sport|enregistre.*sport|ajoute.*séance|sport.*min|sport.*heure|fait.*sport|séance.*sport/i],
  },
  {
    moduleId: 'sport',
    intent: 'workout_program',
    patterns: [/programme.*entraînement|générer.*workout|plan.*sport|créer.*séance|programme.*fitness|programme.*musculation/i],
  },
  {
    moduleId: 'sport',
    intent: 'workout_quick',
    patterns: [/séance.*rapide|workout.*rapide|express.*sport|entraînement.*express/i],
  },
  {
    moduleId: 'sport',
    intent: 'exercise_query',
    patterns: [/exercice.*pour|exercice.*muscle|muscle.*dos|muscle.*bras|muscle.*jambes|exercice.*dos|exercice.*bras/i],
  },
  {
    moduleId: 'sport',
    intent: 'sport_advice',
    patterns: [/conseil.*sport|astuce.*entraînement|motivation.*sport|récupération.*sport|progression.*sport/i],
  },
  {
    moduleId: 'donnees',
    intent: 'save_note',
    patterns: [/note.*sauvegarde|sauvegarde.*note|écris.*note|mémorise|souviens.*toi|je note.*que/i],
  },
  {
    moduleId: 'donnees',
    intent: 'get_notes',
    patterns: [/mes notes|affiche.*note|liste.*note|rappelle.*note/i],
  },
  {
    moduleId: 'donnees',
    intent: 'log_weight',
    patterns: [/poids|pesée|peser|(log|enregistre).*poids/i],
  },
  {
    moduleId: 'donnees',
    intent: 'log_sleep',
    patterns: [/dormi|sommeil|(log|enregistre).*sommeil|coucher.*réveil|qualité.*sommeil/i],
  },
  {
    moduleId: 'donnees',
    intent: 'create_shopping_list',
    patterns: [/liste.*course|liste.*achat|liste.*course|crée.*liste.*course/i],
  },
  {
    moduleId: 'organisation',
    intent: 'task_create',
    patterns: [/je dois|je vais.*(faire|aller|prendre)|il faut que|ajoute.*tâche|ajoute.*tache|crée.*tâche|cree.*tache|nouvelle.*tâche|nouvelle.*tache|todo|à faire|a faire/i],
  },
  {
    moduleId: 'organisation',
    intent: 'event_create',
    patterns: [/rendez-vous|rdv|réunion|reunion|meeting|note.*rendez-vous|crée.*événement|cree.*evenement|planifier.*rdv|calendrier|agenda|programme.*journée|programme.*journee/i],
  },
  {
    moduleId: 'organisation',
    intent: 'goal_create',
    patterns: [/nouvel objectif|nouveau but|je veux.*(atteindre|devenir|accomplir)|créer.*objectif|cree.*objectif/i],
  },
  {
    moduleId: 'organisation',
    intent: 'org_advice',
    patterns: [/conseil.*organisat|astuce.*productiv|prioris|méthode.*travail|methode.*travail|gestion.*temps|organisation/i],
  },
  {
    moduleId: 'recherche',
    intent: 'web_search',
    patterns: [/cherche.*info|recherche.*web|trouve.*info|quel est|qu'est-ce que|c'est quoi|comment fonctionne|actualité.*(tech|sport|politique|monde|fr|usa)|info sur|va chercher.*info|va voir.*site/i],
  },
  {
    moduleId: 'recherche',
    intent: 'scrape_url',
    patterns: [/extrais.*contenu|scrape.*page|contenu de l[ea] page|extrais.*site|résumé.*article/i],
  },
];

function buildDynamicPatterns(): IntentPattern[] {
  const dynamic: IntentPattern[] = [];
  
  // Use registry for dynamic discovery of installed modules
  const installedModules = registry.getInstalledModules();
  
  for (const manifest of installedModules) {
    const module = bus.getModule(manifest.id);
    if (module && module.getSkills) {
      for (const skill of module.getSkills()) {
        if (skill.triggers && skill.triggers.length > 0) {
          const escaped = skill.triggers.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
          dynamic.push({
            moduleId: module.id,
            intent: skill.id,
            patterns: [new RegExp(escaped.join('|'), 'i')],
          });
        }
      }
    }
  }
  return dynamic;
}

function getAllPatterns(): IntentPattern[] {
  const dynamic = buildDynamicPatterns();
  const existing = new Set<string>();
  for (const p of INTENT_PATTERNS) existing.add(`${p.moduleId}:${p.intent}`);
  const merged = [...INTENT_PATTERNS];
  for (const p of dynamic) {
    if (!existing.has(`${p.moduleId}:${p.intent}`)) {
      merged.push(p);
      existing.add(`${p.moduleId}:${p.intent}`);
    }
  }
  return merged;
}

export function getModuleIdsForRole(agentRole?: string): Set<string> {
  if (!agentRole) return new Set(bus.getAllModules().map(m => m.id));
  const allowed = new Set<string>();
  for (const module of bus.getAllModules()) {
    const skills = module.getSkills();
    const hasRestrictions = skills.some(s => s.allowedRoles && s.allowedRoles.length > 0);
    if (!hasRestrictions) { allowed.add(module.id); continue; }
    if (skills.some(s => s.allowedRoles?.includes(agentRole))) allowed.add(module.id);
  }
  return allowed;
}

function lightningDetect(message: string, allowedModuleIds?: Set<string>): BifrostDecision | null {
  const lower = message.toLowerCase().trim();
  if (!lower || lower.length < 3) return null;

  const patterns = getAllPatterns();

  for (const entry of patterns) {
    if (allowedModuleIds && !allowedModuleIds.has(entry.moduleId)) continue;
    for (const pattern of entry.patterns) {
      if (pattern.test(lower)) {
        return {
          intent: entry.intent,
          moduleId: entry.moduleId,
          confidence: 'high',
          reasoning: `Pattern match: ${pattern.source}`,
        };
      }
    }
  }

  return null;
}

async function vectorDetect(
  message: string,
  allowedModuleIds?: Set<string>,
  threshold = 0.65
): Promise<BifrostDecision | null> {
  try {
    const msgEmbedding = await getEmbedding(message);

    let bestScore = 0;
    let best: { moduleId: string; intent: string; description: string } | null = null;

    // Use registry for dynamic module discovery
    const installedModules = registry.getInstalledModules();
    
    for (const manifest of installedModules) {
      const module = bus.getModule(manifest.id);
      if (!module || !module.getSkills) continue;
      
      if (allowedModuleIds && !allowedModuleIds.has(module.id)) continue;
      
      for (const skill of module.getSkills()) {
        const skillText = `${skill.name}: ${skill.description}`;
        const skillEmbedding = await getEmbedding(skillText);
        const score = cosineSimilarity(msgEmbedding.vector, skillEmbedding.vector);
        if (score > bestScore) {
          bestScore = score;
          best = { moduleId: module.id, intent: skill.id, description: skill.description };
        }
      }
    }

    if (best && bestScore >= threshold) {
      return {
        intent: best.intent,
        moduleId: best.moduleId,
        confidence: bestScore >= 0.8 ? 'high' : 'medium',
        reasoning: `Vector match: ${best.description} (score: ${bestScore.toFixed(3)})`,
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function deepDetect(
  message: string,
  context?: { agentName?: string; role?: string; capabilities?: string[] }
): Promise<BifrostDecision | null> {
  try {
    const { aiChat } = await import('@/lib/ai-provider');

    const agentContext = context?.agentName
      ? `\nContexte agent: ${context.agentName} (${context.role || 'assistant'})`
      : '';

    const allowedModuleIds = context?.role ? getModuleIdsForRole(context.role) : null;

    const availableModuleLines = bus.getAllModules()
      .filter(m => !allowedModuleIds || allowedModuleIds.has(m.id))
      .map(m => {
        const manifest = registry.getManifest(m.id);
        const skills = m.getSkills().map(s => s.description).join(', ');
        return `${m.id}: ${skills}${manifest?.description ? ` — ${manifest.description}` : ''}`;
      });
    const availableModules = [
      ...availableModuleLines,
      '(aucun): conversation générale, questions simples',
    ];

    const prompt = `Analyse le message utilisateur et classifie son intention.

Message: "${message}"${agentContext}

Modules disponibles:
${availableModules.join('\n')}

Retourne UNIQUEMENT un objet JSON:
{ "moduleId": "${bus.getAllModules().map(m => m.id).join('"|"')}"|null, "intent": "description_courte", "confidence": "high"|"medium"|"low", "reasoning": "10 mots max" }`;

    const result = await aiChat(prompt, {
      func: 'chat',
      systemPrompt: 'Tu es un classifieur d\'intention. Réponds UNIQUEMENT avec le JSON demandé.',
    });

    if (!result.success || !result.content) return null;

    const cleaned = result.content
      .replace(/```json\s*/g, '')
      .replace(/\s*```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    const validIds = new Set(bus.getAllModules().map(m => m.id));
    if (!parsed.moduleId || !validIds.has(parsed.moduleId)) return null;
    if (allowedModuleIds && !allowedModuleIds.has(parsed.moduleId)) return null;

    return {
      intent: parsed.intent || 'unknown',
      moduleId: parsed.moduleId,
      confidence: parsed.confidence || 'medium',
      reasoning: parsed.reasoning,
    };
  } catch {
    return null;
  }
}

export async function detect(
  message: string,
  mode: DetectionMode = 'lightning',
  context?: { agentName?: string; role?: string; capabilities?: string[] }
): Promise<BifrostDecision | null> {
  const allowedModuleIds = context?.role ? getModuleIdsForRole(context.role) : undefined;

  if (mode === 'lightning') {
    const result = lightningDetect(message, allowedModuleIds);
    if (result) return result;
  }

  if (mode === 'deep') {
    const vectorResult = await vectorDetect(message, allowedModuleIds);
    if (vectorResult) return vectorResult;

    return deepDetect(message, context);
  }

  return null;
}

export { lightningDetect, deepDetect, vectorDetect };

import { db } from '@/lib/db';
import * as cheerio from 'cheerio';
import { executeToolByName as executeAiTool } from '@/lib/ai-tools';

const DEFAULT_USER_ID = 'mindlife-user';

export interface ToolDef {
  id: string;
  label: string;
  description: string;
  execute: (params: any) => Promise<ToolResult>;
  examples: string[];
}

export interface ToolResult {
  success: boolean;
  output: string;
  data?: any;
}

type ToolIntent = 'web_search' | 'scrape_recipe' | 'scrape_content' | 'create_event'
  | 'create_task' | 'create_goal' | 'code_exec' | 'save_note' | 'generate_image'
  | 'data_query'
  | 'save_meal' | 'log_weight' | 'log_sleep' | 'log_sport'
  | 'create_meal_plan' | 'create_shopping_list'
  | 'get_events' | 'get_tasks' | 'get_meals' | 'get_meal_plan' | 'get_shopping_lists' | 'get_notes'
  // Mega-Tools intents
  | 'meal_plan_complex_request' | 'shopping_assistant_request' | 'workout_generator_request';

function detectToolIntent(message: string): ToolIntent | null {
  const lower = message.toLowerCase().trim();

  // INTENTS MEGA-TOOLS (prioritaires)
  if (/recette.*programmer|programmer.*recette|programmer.*demain|programmer.*soir|planifier.*repas|cherche.*recette.*programmer|cherche.*et.*programmer/i.test(lower)) return 'meal_plan_complex_request';
  if (/liste.*course.*intelligente|courses.*optimisées|shopping.*assistant|liste.*courses.*ia/i.test(lower)) return 'shopping_assistant_request';
  if (/programme.*entraînement|générer.*workout|plan.*sport|créer.*séance|programme.*fitness|plan.*musculation/i.test(lower)) return 'workout_generator_request';

  // INTENTS ORIGINAUX
  if (/recette|cuisiner|marmiton|750g|préparer.*plat|ingrédients? pour/i.test(lower)) return 'scrape_recipe';
  if (/rendez-vous|rdv|réunion|meeting|planifier|réserver|calendrier|créer.*événement/i.test(lower)) return 'create_event';
  if (/tâche|tache|todo|à faire|a faire|ajouter.*tâche|task|créer.*tâche/i.test(lower)) return 'create_task';
  if (/objectif|but|goal|atteindre|accomplir|nouvel objectif/i.test(lower)) return 'create_goal';
  if (/cherche|recherche|trouve|quel est|qu'est-ce que|c'est quoi|comment fonctionne|actualité/i.test(lower)) return 'web_search';
  if (/extrais|scrape|va chercher|va voir|contenu de|page web|site/i.test(lower)) return 'scrape_content';

  if (/écris? un (code|script|programme|fonction)|code.*qui|programme.*qui|peux-tu (coder|programmer)|génère.*code|explique.*code|exécute|run/i.test(lower)) return 'code_exec';
  if (/écris? (un|une) (article|poème|lettre|histoire|note|email|mail|texte|rédaction|dissertation|journal|résumé|compte-rendu)|rédige|compose/i.test(lower)) return 'save_note';
  if (/image|photo|dessine|génère.*image|crée.*image|illustration|visuel/i.test(lower)) return 'generate_image';
  if (/analyse|statistiques|moyenne|tendance|évolution|progrès|combien de (fois|kg|calories)|données|graphique/i.test(lower)
    && (/(poids|weight|pèse|kg|sommeil|sleep|sport|repas|meal|calories|humeur|mood)/i.test(lower))) return 'data_query';

  if (/log.*poids|enregistre.*poids|ajoute.*poids|pèse.*kg|poids.*aujourd'hui|poids.*ce (matin|soir)/i.test(lower)) return 'log_weight';
  if (/log.*sommeil|enregistre.*sommeil|ajoute.*sommeil|dormi.*\\d+\\s*h|sommeil.*nuit|\\d+\\s*h(?:eure)?s?\\s*(de sommeil|de dodo|de nuit)/i.test(lower)) return 'log_sleep';
  if (/log.*sport|enregistre.*sport|ajoute.*séance|sport.*(min|heure)|(fait|faire) (du )?sport/i.test(lower)) return 'log_sport';
  if (/ajoute.*repas|ajoute.*plat|ajoute.*(dîner|déjeuner|petit.déjeuner|collation|goûter)|(manger|mange) (ce soir|ce midi|ce matin)|nouveau repas|repas.*(kcal|calories)|enregistre.*repas|enregistre.*plat|enregistre.*recette|sauvegarde.*repas/i.test(lower)) return 'save_meal';
  if (/plan.*repas|plan.*alimentaire|menu.*(semaine|jour)|planifie.*repas|programme.*repas/i.test(lower)) return 'create_meal_plan';
  if (/liste.*course|liste.*achats|course(s)?.*(faire|besoin)|achats/i.test(lower)) return 'create_shopping_list';
  if (/mes (événements|rendez-vous|rdv|réunions)|voir.*(événements|agenda|calendrier)|affiche.*(événements|agenda)/i.test(lower)) return 'get_events';
  if (/mes (tâches|taches)|voir.*tâches|affiche.*tâches|liste.*tâches/i.test(lower)) return 'get_tasks';
  if (/mes repas|voir repas|affiche repas|liste repas|qu'est-ce (qu'on a mangé|j'ai mangé)/i.test(lower)) return 'get_meals';
  if (/mon plan repas|voir plan|affiche plan.*repas/i.test(lower)) return 'get_meal_plan';
  if (/mes listes|voir listes.*course|affiche listes.*course/i.test(lower)) return 'get_shopping_lists';
  if (/mes notes|voir notes|affiche notes|liste notes/i.test(lower)) return 'get_notes';

  return null;
}

export async function executeTool(tool: ToolIntent, params: any, userId = DEFAULT_USER_ID): Promise<ToolResult> {
  switch (tool) {
    case 'web_search': return searchWeb(params.query);
    case 'scrape_recipe': return scrapeRecipe(params.query);
    case 'scrape_content': return scrapeContent(params.url);
    case 'create_event': return createEvent(userId, params);
    case 'create_task': return createTask(userId, params);
    case 'create_goal': return createGoal(userId, params);
    case 'code_exec': return execCode(params.code, params.language);
    case 'save_note': return saveNote(userId, params);
    case 'generate_image': return generateImage(params.query);
    case 'data_query': return queryUserData(userId, params);
    case 'save_meal': return wrapAiTool(executeAiTool('save_meal', params, userId));
    case 'log_weight': return wrapAiTool(executeAiTool('log_weight', params, userId));
    case 'log_sleep': return wrapAiTool(executeAiTool('log_sleep', params, userId));
    case 'log_sport': return wrapAiTool(executeAiTool('log_sport_session', params, userId));
    case 'create_meal_plan': return wrapAiTool(executeAiTool('create_meal_plan', params, userId));
    case 'create_shopping_list': return wrapAiTool(executeAiTool('create_shopping_list', params, userId));
    case 'get_events': return wrapAiTool(executeAiTool('get_events', params, userId));
    case 'get_tasks': return wrapAiTool(executeAiTool('get_tasks', params, userId));
    case 'get_meals': return wrapAiTool(executeAiTool('get_meals', params, userId));
    case 'get_meal_plan': return wrapAiTool(executeAiTool('get_meal_plan', params, userId));
    case 'get_shopping_lists': return wrapAiTool(executeAiTool('get_shopping_lists', params, userId));
    case 'get_notes': return wrapAiTool(executeAiTool('get_notes', params, userId));
    // Mega-Tools execution
    case 'meal_plan_complex_request': return wrapAiTool(executeAiTool('meal_plan_complex', params, userId));
    case 'shopping_assistant_request': return wrapAiTool(executeAiTool('ai_shopping_assistant', params, userId));
    case 'workout_generator_request': return wrapAiTool(executeAiTool('workout_generator', params, userId));
    default: return { success: false, output: 'Tool not found' };
  }
}

export function detectAndExecute(message: string, userId = DEFAULT_USER_ID): Promise<ToolResult | null> {
  const intent = detectToolIntent(message);
  if (!intent) return Promise.resolve(null);
  const params = extractParams(intent, message);
  return executeTool(intent, params, userId);
}

async function wrapAiTool(promise: Promise<string>): Promise<ToolResult> {
  const output = await promise;
  return { success: !output.startsWith('❌'), output };
}

function extractParams(intent: ToolIntent, message: string): any {
  switch (intent) {
    case 'web_search': return { query: message.replace(/cherche|recherche|trouve|quel est|qu'est-ce que|c'est quoi|qui est|comment fonctionne/gi, '').trim() };
    case 'scrape_recipe': return { query: message };
    case 'scrape_content': {
      const urlMatch = message.match(/https?:\/\/[^\s]+/);
      return { url: urlMatch ? urlMatch[0] : message };
    }
    case 'create_event': return { query: message };
    case 'create_task': return { query: message };
    case 'create_goal': return { query: message };
    case 'code_exec': {
      const langMap: Record<string, string> = { javascript: 'javascript', js: 'javascript', typescript: 'typescript', ts: 'typescript', python: 'python', py: 'python', html: 'html', css: 'css', bash: 'bash', shell: 'bash' };
      const langMatch = message.match(/(javascript|typescript|python|html|css|bash|shell|js|ts|py)\\b/i);
      return { code: message, language: langMatch ? (langMap[langMatch[1].toLowerCase()] || 'javascript') : 'javascript' };
    }
    case 'save_note': return { title: 'Note générée', content: message };
    case 'generate_image': {
      const q = message.replace(/image|photo|dessine|génère.*image|crée.*image|illustration|visuel/gi, '').trim();
      return { query: q || message };
    }
    case 'data_query': return { query: message };
    case 'save_meal': return { query: message };
    case 'log_weight': return { query: message };
    case 'log_sleep': return { query: message };
    case 'log_sport': return { query: message };
    case 'create_meal_plan': return { query: message };
    case 'create_shopping_list': return { query: message };
    case 'get_events': return {};
    case 'get_tasks': return {};
    case 'get_meals': return {};
    case 'get_meal_plan': return {};
    case 'get_shopping_lists': return {};
    case 'get_notes': return {};
    // Mega-Tools params extraction
    case 'meal_plan_complex_request': {
      const recipeMatch = message.match(/recette\s+(?:d|de|d'une|d'un)?\s*([^,.]+?)(?:\s+et|,|\s+pour|$)/i);
      const query = recipeMatch ? recipeMatch[1] : message.replace(/recette.*?(?:d|de|d'une|d'un)?/i, '').trim();
      const dateMatch = message.match(/(?:pour|programmer?|prévoir)\s+(?:demain|ce soir|demain soir|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/i);
      return { query: query || message, date: null, mealType: 'dinner', servings: 4 };
    }
    case 'shopping_assistant_request': {
      const budgetMatch = message.match(/(\d+)\s*€/i);
      return { query: message, budget: budgetMatch ? parseInt(budgetMatch[1]) : null };
    }
    case 'workout_generator_request': {
      const goalMatch = message.match(/(?:pour|objectif|but)\s+(?:[^,\.]+)/i);
      const goal = goalMatch ? goalMatch[1] : 'santé';
      const durationMatch = message.match(/(\d+)\s*min/i);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 45;
      return { goal, duration, level: 'intermédiaire', equipment: 'minimal' };
    }
    default: return {};
  }
}

async function searchWeb(query: string): Promise<ToolResult> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    const results: string[] = [];
    $('.result__body').slice(0, 5).each((_, el) => {
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__url').attr('href') || '';
      if (title) results.push(`• ${title}\\n  ${snippet}\\n  ${link}`);
    });
    if (results.length === 0) return { success: true, output: 'Aucun résultat trouvé.' };
    return { success: true, output: `🌐 Résultats pour "${query}":\\n\\n${results.slice(0, 3).join('\\n\\n')}\\n\\nℹ️ ${results.length} résultats trouvés.` };
  } catch (e) {
    return { success: false, output: `Erreur recherche: ${e}` };
  }
}

async function scrapeContent(url: string): Promise<ToolResult> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header, aside').remove();
    const title = $('title').text().trim();
    const text = $('body').text().replace(/\\s+/g, ' ').trim().slice(0, 3000);
    return { success: true, output: `📄 **${title}**\\n\\n${text.slice(0, 1500)}...` };
  } catch (e) {
    return { success: false, output: `Erreur extraction: ${e}` };
  }
}

async function scrapeRecipe(query: string): Promise<ToolResult> {
  try {
    const sites = [
      `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(query)}`,
      `https://www.750g.com/recherche/${encodeURIComponent(query)}.htm`,
    ];
    for (const siteUrl of sites) {
      const res = await fetch(siteUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const $ = cheerio.load(html);
      const firstLink = $('a[href*="/recettes/"], a[href*="/recette/"]').first().attr('href');
      if (firstLink) {
        const recipeUrl = firstLink.startsWith('http') ? firstLink : `https://www.marmiton.org${firstLink}`;
        const recipeRes = await fetch(recipeUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const recipeHtml = await recipeRes.text();
        const $$ = cheerio.load(recipeHtml);
        const title = $$('h1').first().text().trim();
        const ingredients: string[] = [];
        $$('.ingredient, [class*="ingredient"] li, .recipe-ingredients li').each((_, el) => {
          const t = $$(el).text().trim();
          if (t) ingredients.push(t);
        });
        const steps: string[] = [];
        $$('.recipe-steps li, [class*="step"] li, .preparation li').each((_, el) => {
          const t = $$(el).text().trim();
          if (t) steps.push(t);
        });
        let output = `🍳 **${title}**\\n\\n`;
        if (ingredients.length > 0) output += `**Ingrédients :**\\n${ingredients.map(i => `• ${i}`).join('\\n')}\\n\\n`;
        if (steps.length > 0) output += `**Préparation :**\\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\\n')}`;
        if (ingredients.length === 0 && steps.length === 0) output += `Recette trouvée : ${recipeUrl}`;
        return { success: true, output: output.slice(0, 2000) };
      }
    }
    return { success: true, output: 'Aucune recette trouvée.' };
  } catch (e) {
    return { success: false, output: `Erreur recette: ${e}` };
  }
}

async function createEvent(userId: string, params: any): Promise<ToolResult> {
  try {
    const now = new Date();
    let date = new Date(now);
    date.setHours(date.getHours() + 1, 0, 0, 0);
    const q = params.query || '';
    if (/demain/i.test(q)) date.setDate(date.getDate() + 1);
    else if (/après[- ]?demain/i.test(q)) date.setDate(date.getDate() + 2);
    const title = q.replace(/crée|planifier|ajouter|rendez-vous|rdv|réunion|meeting/gi, '').trim().slice(0, 100) || 'Événement';
    const eventId = `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await db.event.create({
      data: { id: eventId, userId, title, startAt: date, endAt: new Date(date.getTime() + 3600000), color: '#3b82f6', isAllDay: false },
    });
    return {
      success: true,
      output: `📅 **Événement créé !**\\n\\n**${title}**\\n🗓️ ${date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}\\n⏰ ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    };
  } catch (e) {
    return { success: false, output: `Erreur création événement: ${e}` };
  }
}

async function createGoal(userId: string, params: any): Promise<ToolResult> {
  try {
    const q = params.query || '';
    const title = q.replace(/crée|ajoute|nouvel?|objectif|goal/gi, '').trim().slice(0, 200) || 'Nouvel objectif';
    const goalId = `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await db.goal.create({
      data: { id: goalId, userId, title, status: 'active', priority: 'a_planifier', startDate: new Date(), createdAt: new Date() },
    });
    return { success: true, output: `🎯 **Objectif créé :** "${title}"` };
  } catch (e) {
    return { success: false, output: `Erreur création objectif: ${e}` };
  }
}

async function createTask(userId: string, params: any): Promise<ToolResult> {
  try {
    const q = params.query || '';
    const title = q.replace(/ajoute|crée|nouvelle?|tâche|tache|todo/gi, '').trim().slice(0, 200) || 'Nouvelle tâche';
    const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await db.task.create({
      data: { id: taskId, userId, title, priority: 'medium', status: 'pending', createdAt: new Date() },
    });
    return { success: true, output: `✅ **Tâche créée :** "${title}"` };
  } catch (e) {
    return { success: false, output: `Erreur création tâche: ${e}` };
  }
}

async function execCode(code: string, language: string): Promise<ToolResult> {
  try {
    const codeMatch = code.match(/```(?:\\w+)?\\n([\\s\\S]*?)```/);
    const cleanCode = codeMatch ? codeMatch[1].trim() : code.replace(/^(écris|code|programme|exécute|run).*/i, '').trim();
    if (!cleanCode || cleanCode.length < 5) {
      return { success: true, output: 'Donne-moi le code à exécuter ou écris "code: ..." pour que je le tape.' };
    }
    const langMap: Record<string, string> = { javascript: 'javascript', js: 'javascript', typescript: 'typescript', ts: 'typescript', python: 'python', py: 'python', html: 'html', css: 'css', bash: 'bash', shell: 'bash' };
    const langMatch = code.match(/(javascript|typescript|python|html|css|bash|shell|js|ts|py)\\b/i);
    const pistonLang = langMap[langMatch ? (langMap[langMatch[1].toLowerCase()] || 'javascript') : 'javascript'] || 'javascript';
    const pistonVersion: Record<string, string> = { javascript: '18.15.0', python: '3.10.0', typescript: '5.0.3', bash: '5.2.15', html: '5.0.0', css: '3.0.0' };
    try {
      const pistonRes = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: pistonLang, version: pistonVersion[pistonLang] || '*', files: [{ content: cleanCode }] }),
      });
      if (pistonRes.ok) {
        const data = await pistonRes.json();
        const stdout = data.run?.stdout || '';
        const stderr = data.run?.stderr || '';
        const output = [stdout, stderr].filter(Boolean).join('\\n').trim();
        return { success: true, output: output ? `💻 **Exécution ${language} :**\\n\`\`\`\\n${output.slice(0, 1500)}\\n\`\`\`` : `💻 Code exécuté avec succès (aucune sortie).` };
      }
    } catch {}
    return { success: true, output: `💻 **Code ${language} :**\\n\\n\`\`\`${language}\\n${cleanCode.slice(0, 1500)}\\n\`\`\`\\n\\nℹ️ Copie ce code et exécute-le dans ton environnement.` };
  } catch (e) {
    return { success: false, output: `Erreur exécution: ${e}` };
  }
}

async function saveNote(userId: string, params: any): Promise<ToolResult> {
  try {
    let title = params.title || 'Note générée';
    let content = params.content || '';
    const writingPatterns = [/écris? (un|une) (article|poème|lettre|histoire|email|mail|texte|rédaction|dissertation)[^]*/i, /rédige[^]*/i, /compose[^]*/i, /génère[^]*/i];
    for (const p of writingPatterns) {
      const m = content.match(p);
      if (m) { content = content.replace(m[0], '').trim(); break; }
    }
    const noteTitle = content.slice(0, 60).trim() || title;
    const noteId = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await db.note.create({
      data: { id: noteId, userId, title: noteTitle, content: content || 'Contenu généré par IA', createdAt: new Date(), updatedAt: new Date() },
    });
    return { success: true, output: `📝 **Note sauvegardée :** "${noteTitle}"\\n\\nRetrouve-la dans l'onglet Notes.` };
  } catch (e) {
    return { success: false, output: `Erreur sauvegarde note: ${e}` };
  }
}

async function generateImage(query: string): Promise<ToolResult> {
  try {
    const q = query.replace(/image|photo|dessine|génère|crée|illustration|visuel/gi, '').trim() || query;
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=3&client_id=RMgkOw5hFKBCNF9bZfnLEd_jmFhQ7k0LJMLLz_5r5bA`);
    if (res.ok) {
      const data = await res.json();
      if (data.results?.length > 0) {
        const images = data.results.slice(0, 3).map((img: any) => `![${img.alt_description || q}](${img.urls.small})`);
        return { success: true, output: `🎨 **Images pour "${q}" :**\\n\\n${images.join('\\n\\n')}\\n\\n_Source: Unsplash_`, data: data.results.slice(0, 3).map((img: any) => ({ url: img.urls.small, alt: img.alt_description || q })) };
      }
    }
    return { success: true, output: `Je n'ai pas trouvé d'images pour "${q}". Essaie une autre recherche.` };
  } catch (e) {
    return { success: false, output: `Erreur recherche image: ${e}` };
  }
}

async function queryUserData(userId: string, params: any): Promise<ToolResult> {
  try {
    const q = params.query || '';
    const insights: string[] = [];
    if (/poids|weight|pèse|kg/i.test(q)) {
      const weights = await db.weightEntry.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 7 });
      if (weights.length > 0) {
        const vals = weights.map(w => w.weight).reverse();
        const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
        const trend = vals.length > 1 ? (vals[vals.length - 1] - vals[0]).toFixed(1) : '0';
        insights.push(`📊 **Poids** (${weights.length} jours) : moyenne ${avg} kg, tendance ${trend.startsWith('-') ? '' : '+'}${trend} kg`);
        insights.push(weights.map(w => `• ${new Date(w.date).toLocaleDateString('fr-FR')}: ${w.weight} kg`).join('\\n'));
      }
    }
    if (/sommeil|sleep|dormi|nuit/i.test(q)) {
      const sleeps = await db.sleepEntry.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 7 });
      if (sleeps.length > 0) {
        const avg = (sleeps.reduce((a, s) => a + (s.duration || 0), 0) / sleeps.length).toFixed(1);
        insights.push(`😴 **Sommeil** (${sleeps.length} nuits) : moyenne ${avg}h`);
        insights.push(sleeps.map(s => `• ${new Date(s.date).toLocaleDateString('fr-FR')}: ${s.duration || 0}h`).join('\\n'));
      }
    }
    if (/sport|entraînement|workout|exercice/i.test(q)) {
      const sessions = await db.workoutSession.findMany({ where: { SportProfile: { userId } }, orderBy: { date: 'desc' }, take: 7 });
      if (sessions.length > 0) {
        const total = sessions.reduce((a, s) => a + (s.duration || 0), 0);
        insights.push(`🏋️ **Sport** (${sessions.length} séances) : ${total} min total`);
        insights.push(sessions.map(s => `• ${new Date(s.date).toLocaleDateString('fr-FR')}: ${s.name || 'Séance'} - ${s.duration || 0}min`).join('\\n'));
      }
    }
    if (/repas|meal|calories|manger|bouffe/i.test(q)) {
      const meals = await db.meal.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 10 });
      if (meals.length > 0) {
        const totalCal = meals.reduce((a, m) => a + (m.calories || 0), 0);
        insights.push(`🍽️ **Repas** (${meals.length}) : ${totalCal} kcal total`);
        insights.push(meals.map(m => `• ${new Date(m.date).toLocaleDateString('fr-FR')}: ${m.name || 'Repas'} (${m.calories || 0} kcal)`).join('\\n'));
      }
    }
    if (insights.length === 0) return { success: true, output: 'Aucune donnée trouvée pour cette analyse. Les données disponibles : poids, sommeil, sport, repas.' };
    return { success: true, output: `📊 **Analyse de données**\\n\\n${insights.join('\\n\\n')}` };
  } catch (e) {
    return { success: false, output: `Erreur analyse données: ${e}` };
  }
}

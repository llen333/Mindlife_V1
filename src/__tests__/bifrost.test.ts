import { describe, it, expect, beforeAll } from 'vitest';

describe('Bifrost lightning detection', () => {
  let lightningDetect: any;

  beforeAll(async () => {
    const detector = await import('@/lib/bifrost/detector');
    lightningDetect = detector.lightningDetect;
  });

  it('detects nutrition — recipe search', () => {
    const result = lightningDetect('donne moi une recette de poulet');
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('nutrition');
    expect(result.intent).toBe('recipe_search');
    expect(result.confidence).toBe('high');
  });

  it('detects nutrition — meal log', () => {
    const result = lightningDetect("j'ai mangé une salade ce midi");
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('nutrition');
    expect(result.intent).toBe('meal_log');
  });

  it('detects sport — workout log', () => {
    const result = lightningDetect("j'ai fait 30 min de sport");
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('sport');
    expect(result.intent).toBe('workout_log');
  });

  it('detects donnees — save note', () => {
    const result = lightningDetect('sauvegarde cette note pour moi');
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('donnees');
    expect(result.intent).toBe('save_note');
  });

  it('detects organisation — task create', () => {
    const result = lightningDetect('je dois acheter du pain');
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('organisation');
    expect(result.intent).toBe('task_create');
  });

  it('detects organisation — event create', () => {
    const result = lightningDetect('rendez-vous chez le dentiste');
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('organisation');
    expect(result.intent).toBe('event_create');
  });

  it('detects recherche — web search', () => {
    const result = lightningDetect('trouve des infos sur le climat');
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('recherche');
    expect(result.intent).toBe('web_search');
  });

  it('returns null for very short messages', () => {
    expect(lightningDetect('ok')).toBeNull();
    expect(lightningDetect(' ')).toBeNull();
  });

  it('returns null for short gibberish', () => {
    expect(lightningDetect('a')).toBeNull();
    expect(lightningDetect('ab')).toBeNull();
  });

  it('filters by allowed module ids', () => {
    const allowed = new Set(['nutrition']);
    const result = lightningDetect("j'ai fait 30 min de sport", allowed);
    expect(result).toBeNull(); // sport not in allowed set
  });

  it('allows nutrition when in allowed set', () => {
    const allowed = new Set(['nutrition']);
    const result = lightningDetect('donne moi une recette', allowed);
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('nutrition');
  });

  it('detects donnees — log weight', () => {
    const result = lightningDetect("enregistre mon poids");
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('donnees');
    expect(result.intent).toBe('log_weight');
  });

  it('detects donnees — create shopping list', () => {
    const result = lightningDetect('crée une liste de course');
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('donnees');
    expect(result.intent).toBe('create_shopping_list');
  });

  it('detects donnees — log sleep', () => {
    const result = lightningDetect('j\'ai bien dormi cette nuit');
    expect(result).not.toBeNull();
    expect(result.moduleId).toBe('donnees');
    expect(result.intent).toBe('log_sleep');
  });
});

describe('Bifrost role-based module filtering', () => {
  beforeAll(async () => {
    // Modules auto-register on import
    await import('@/lib/modules');
  });

  it('restricts nutrition to nutrition/assistant roles', async () => {
    const { getModuleIdsForRole } = await import('@/lib/bifrost/detector');
    const coachAllowed = getModuleIdsForRole('coach');
    expect(coachAllowed.has('nutrition')).toBe(false);
    expect(coachAllowed.has('sport')).toBe(true);
    expect(coachAllowed.has('donnees')).toBe(true);

    const nutritionAllowed = getModuleIdsForRole('nutrition');
    expect(nutritionAllowed.has('nutrition')).toBe(true);
    expect(nutritionAllowed.has('sport')).toBe(true); // sport has nutrition in allowedRoles
  });

  it('allows all modules for assistant role', async () => {
    const { getModuleIdsForRole } = await import('@/lib/bifrost/detector');
    const allowed = getModuleIdsForRole('assistant');
    expect(allowed.has('nutrition')).toBe(true);
    expect(allowed.has('sport')).toBe(true);
    expect(allowed.has('donnees')).toBe(true);
    expect(allowed.has('organisation')).toBe(true);
    expect(allowed.has('recherche')).toBe(true);
  });

  it('restricts recherche to oracle/assistant', async () => {
    const { getModuleIdsForRole } = await import('@/lib/bifrost/detector');
    const coachAllowed = getModuleIdsForRole('coach');
    expect(coachAllowed.has('recherche')).toBe(false);

    const oracleAllowed = getModuleIdsForRole('oracle');
    expect(oracleAllowed.has('recherche')).toBe(true);
  });

  it('allows all modules when no role provided', async () => {
    const { getModuleIdsForRole } = await import('@/lib/bifrost/detector');
    const all = getModuleIdsForRole();
    expect(all.has('nutrition')).toBe(true);
    expect(all.has('sport')).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';

describe('Bus types — Module interface shape', () => {
  it('validates module contract', () => {
    const module = {
      id: 'test',
      name: 'Test',
      canHandle: (i: string) => i === 'test',
      execute: async () => ({ success: true, content: 'ok', moduleId: 'test' }),
      getTools: () => [],
      getSkills: () => [{ id: 'test-skill', name: 'Test', description: 'A test skill', allowedRoles: ['assistant'] }],
    };
    expect(module.id).toBe('test');
    expect(module.canHandle('test')).toBe(true);
    expect(module.canHandle('other')).toBe(false);
    expect(module.getSkills()[0].allowedRoles).toContain('assistant');
  });
});

describe('NutritionModule', () => {
  it('handles food-related intents', async () => {
    const { NutritionModule } = await import('@/lib/modules/nutrition/index');
    const mod = new NutritionModule();
    expect(mod.canHandle('recette de poulet')).toBe(true);
    expect(mod.canHandle('plan repas')).toBe(true);
    expect(mod.canHandle('calories du déjeuner')).toBe(true);
    expect(mod.canHandle('weather forecast')).toBe(false);
  });

  it('returns skills with allowedRoles', async () => {
    const { NutritionModule } = await import('@/lib/modules/nutrition/index');
    const skills = new NutritionModule().getSkills();
    expect(skills).toHaveLength(4);
    for (const s of skills) {
      expect(s.allowedRoles).toBeDefined();
      expect(s.allowedRoles).toContain('nutrition');
    }
  });
});

describe('SportModule', () => {
  it('handles sport-related intents', async () => {
    const { SportModule } = await import('@/lib/modules/sport/index');
    const mod = new SportModule();
    expect(mod.canHandle('sport')).toBe(true);
    expect(mod.canHandle('programme musculation')).toBe(true);
    expect(mod.canHandle('exercice pour les bras')).toBe(true);
    expect(mod.canHandle('recette de cuisine')).toBe(false);
  });

  it('returns skills with allowedRoles', async () => {
    const { SportModule } = await import('@/lib/modules/sport/index');
    const skills = new SportModule().getSkills();
    expect(skills).toHaveLength(4);
    expect(skills[0].allowedRoles).toContain('coach');
  });
});

describe('OrganisationModule', () => {
  it('handles task/event/goal intents', async () => {
    const { OrganisationModule } = await import('@/lib/modules/organisation/index');
    const mod = new OrganisationModule();
    expect(mod.canHandle('tâche à faire')).toBe(true);
    expect(mod.canHandle('rendez-vous demain')).toBe(true);
    expect(mod.canHandle('nouvel objectif')).toBe(true);
    expect(mod.canHandle('sport')).toBe(false);
  });

  it('returns skills with allowedRoles', async () => {
    const { OrganisationModule } = await import('@/lib/modules/organisation/index');
    const skills = new OrganisationModule().getSkills();
    expect(skills).toHaveLength(4);
    expect(skills[0].allowedRoles).toContain('organization');
  });
});

describe('RechercheModule', () => {
  it('handles web_search and scrape_url intents', async () => {
    const { RechercheModule } = await import('@/lib/modules/recherche/index');
    const mod = new RechercheModule();
    expect(mod.canHandle('web_search')).toBe(true);
    expect(mod.canHandle('scrape_url')).toBe(true);
    expect(mod.canHandle('nutrition')).toBe(false);
  });

  it('returns skills with allowedRoles', async () => {
    const { RechercheModule } = await import('@/lib/modules/recherche/index');
    const skills = new RechercheModule().getSkills();
    expect(skills).toHaveLength(2);
    expect(skills[0].allowedRoles).toContain('oracle');
  });
});

describe('DonneesModule', () => {
  it('handles data-related intents', async () => {
    const { DonneesModule } = await import('@/lib/modules/donnees/index');
    const mod = new DonneesModule();
    expect(mod.canHandle('save_note')).toBe(true);
    expect(mod.canHandle('log_weight')).toBe(true);
    expect(mod.canHandle('log_sleep')).toBe(true);
    expect(mod.canHandle('create_shopping_list')).toBe(true);
    expect(mod.canHandle('sport')).toBe(false);
  });

  it('returns skills with allowedRoles', async () => {
    const { DonneesModule } = await import('@/lib/modules/donnees/index');
    const skills = new DonneesModule().getSkills();
    expect(skills).toHaveLength(4);
    // notes accessible by all
    expect(skills[0].allowedRoles).toContain('assistant');
    expect(skills[0].allowedRoles).toContain('psychologist');
    // weight only coach/nutrition/assistant
    expect(skills[1].allowedRoles).not.toContain('psychologist');
    expect(skills[1].allowedRoles).toContain('coach');
  });
});

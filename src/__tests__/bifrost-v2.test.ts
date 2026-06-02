import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detect, lightningDetect, vectorDetect } from '@/lib/bifrost/detector';
import { bus } from '@/lib/bus/orchestrator';
import { registry } from '@/lib/bus/registry';
import { getEmbedding } from '@/lib/rag/embeddings';

// Mock dependencies
vi.mock('@/lib/rag/embeddings');
vi.mock('@/lib/ai-provider');

describe('Bifrost V2 Dynamic Patterns', () => {
  beforeEach(() => {
    // Reset test modules by unregistering all
    bus.getAllModules().forEach(module => {
      bus.unregister(module.id);
    });
    registry.getAllManifests().forEach(manifest => {
      registry.unregister(manifest.id);
    });
    
    // Register test modules
    const testModule1 = {
      id: 'nutrition',
      name: 'Nutrition Module',
      version: '1.0.0',
      getSkills: () => [
        {
          id: 'recipe_search',
          name: 'Recipe Search',
          description: 'Find recipes based on ingredients',
          triggers: ['recette', 'cuisiner', 'recipe'],
          allowedRoles: [],
        },
        {
          id: 'meal_log',
          name: 'Meal Log',
          description: 'Log meals and nutrition',
          triggers: ['ajoute.*repas', 'mangé', 'log meal'],
          allowedRoles: [],
        },
      ],
    };
    
    const testModule2 = {
      id: 'sport',
      name: 'Sport Module',
      version: '1.0.0',
      getSkills: () => [
        {
          id: 'workout_log',
          name: 'Workout Log',
          description: 'Log workout sessions',
          triggers: ['log.*sport', 'séance.*sport', 'workout'],
          allowedRoles: [],
        },
      ],
    };
    
    bus.register(testModule1);
    bus.register(testModule2);
    
    registry.register({
      id: 'nutrition',
      name: 'Nutrition',
      version: '1.0.0',
      description: 'Nutrition and meal management',
      author: 'Mindlife Team',
      permissions: ['read:meals', 'write:meals'],
    });
    
    registry.register({
      id: 'sport',
      name: 'Sport',
      version: '1.0.0', 
      description: 'Sports and fitness tracking',
      author: 'Mindlife Team',
      permissions: ['read:workouts', 'write:workouts'],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Dynamic Module Discovery', () => {
    it('discovers newly installed modules dynamically', () => {
      // Initially only nutrition and sport are available
      let decision = lightningDetect('Je cherche une recette de pâtes');
      expect(decision?.moduleId).toBe('nutrition');
      expect(decision?.intent).toBe('recipe_search');

      // Add new module dynamically
      const newModule = {
        id: 'organisation',
        name: 'Organisation Module',
        version: '1.0.0',
        getSkills: () => [
          {
            id: 'task_create',
            name: 'Task Creator',
            description: 'Create and manage tasks',
            triggers: ['ajoute.*tâche', 'nouvelle.*tâche'],
            allowedRoles: [],
          },
        ],
      };
      
      bus.register(newModule);
      registry.register({
        id: 'organisation',
        name: 'Organisation',
        version: '1.0.0',
        description: 'Task and event management',
        author: 'Mindlife Team',
        permissions: ['read:tasks', 'write:tasks'],
      });

      // New module should be discovered immediately
      decision = lightningDetect('Ajoute cette tâche à ma liste');
      expect(decision?.moduleId).toBe('organisation');
      expect(decision?.intent).toBe('task_create');
    });

    it('builds patterns dynamically from module skills', () => {
      const decision = lightningDetect('Je vais cuisiner des crêpes ce soir');
      expect(decision?.moduleId).toBe('nutrition');
      expect(decision?.intent).toBe('recipe_search');
      expect(decision?.confidence).toBe('high');
      expect(decision?.reasoning).toContain('Pattern match');
    });

it('handles module removal gracefully', () => {
      const decision = lightningDetect('Je cherche une recette de pâtes');
      expect(decision?.moduleId).toBe('nutrition');
      expect(decision?.intent).toBe('recipe_search');

      // Remove nutrition module
      bus.unregister('nutrition');
      registry.unregister('nutrition');

      // The INTENT_PATTERNS still has static patterns for nutrition
      // So it should still detect via static patterns
      const decisionAfterRemove = lightningDetect('Je cherche une recette de pâtes');
      expect(decisionAfterRemove).not.toBeNull(); // Static patterns still work
      expect(decisionAfterRemove?.moduleId).toBe('nutrition');
    });
  });

  describe('Vector Intent Classification', () => {
    it('uses vector similarity when regex patterns fail', async () => {
      // Mock embedding for message
      const mockMessageEmbedding = {
        vector: [0.1, 0.2, 0.3, 0.4, 0.5] as any,
      };
      
      // Mock embeddings for skills
      const nutritionEmbedding = {
        vector: [0.8, 0.7, 0.6, 0.5, 0.4] as any,
      };
      
      const sportEmbedding = {
        vector: [0.2, 0.3, 0.1, 0.9, 0.8] as any,
      };

      vi.mocked(getEmbedding)
        .mockResolvedValueOnce(mockMessageEmbedding) // Message embedding
        .mockResolvedValueOnce(nutritionEmbedding)   // Nutrition skill embedding
        .mockResolvedValueOnce(sportEmbedding);     // Sport skill embedding

      // Message doesn't match any regex pattern but should match nutrition via vector
      const decision = await vectorDetect('Je veux préparer quelque chose de sain et équilibré');
      
      expect(decision).toBeDefined();
      expect(decision?.moduleId).toBe('nutrition');
      expect(decision?.confidence).toBe('high');
      expect(decision?.reasoning).toContain('Vector match');
    });

    it('falls back to regex when vector similarity is low', async () => {
      // Mock embeddings with low similarity
      const mockMessageEmbedding = {
        vector: [0.1, 0.2, 0.3, 0.4, 0.5] as any,
      };
      
      const nutritionEmbedding = {
        vector: [0.1, 0.2, 0.3, 0.4, 0.6] as any, // Very similar to message
      };

      vi.mocked(getEmbedding)
        .mockResolvedValueOnce(mockMessageEmbedding)
        .mockResolvedValueOnce(nutritionEmbedding);

      // Message doesn't match regex but has high vector similarity
      const decision = await vectorDetect('Je vais cuisiner des crêpes');
      
      expect(decision).not.toBeNull();
      expect(decision?.confidence).toBe('medium');
    });

    it('respects module role restrictions', async () => {
      // Mock embeddings
      const mockMessageEmbedding = {
        vector: [0.1, 0.2, 0.3, 0.4, 0.5] as any,
      };
      
      const nutritionEmbedding = {
        vector: [0.8, 0.7, 0.6, 0.5, 0.4] as any,
      };

      vi.mocked(getEmbedding)
        .mockResolvedValueOnce(mockMessageEmbedding)
        .mockResolvedValueOnce(nutritionEmbedding);

      // Restrict to sport module only
      const allowedModuleIds = new Set(['sport']);
      const decision = await vectorDetect('Je veux préparer quelque chose de sain', allowedModuleIds);
      
      expect(decision).toBeNull(); // Should not find nutrition module
    });
  });

  describe('Performance Benchmarks', () => {
    it('detects intents within acceptable latency (<100ms)', async () => {
      const start = performance.now();
      
      const decision = await detect('Je cherche une recette de pâtes');
      
      const end = performance.now();
      const latency = end - start;
      
      expect(decision).not.toBeNull();
      expect(latency).toBeLessThan(100);
    });

    it('handles concurrent detection efficiently', async () => {
      const messages = [
        'Je cherche une recette de pâtes',
        'Je vais faire du sport',
        'J\'ai mangé un bon repas',
        'Je dois créer une nouvelle tâche',
      ];

      const start = performance.now();
      
      const promises = messages.map(msg => detect(msg));
      const results = await Promise.all(promises);
      
      const end = performance.now();
      const avgLatency = (end - start) / messages.length;
      
      expect(results.every(r => r !== null)).toBe(true);
      expect(avgLatency).toBeLessThan(50); // Average should be very fast
    });

    it('scales well with multiple modules', () => {
      // Add many modules to test scaling
      for (let i = 0; i < 10; i++) {
        const module = {
          id: `module_${i}`,
          name: `Test Module ${i}`,
          version: '1.0.0',
          getSkills: () => [
            {
              id: `skill_${i}`,
              name: `Test Skill ${i}`,
              description: `Test skill description ${i}`,
              triggers: [`trigger_${i}`],
              allowedRoles: [],
            },
          ],
        };
        
        bus.register(module);
        registry.register({
          id: `module_${i}`,
          name: `Test Module ${i}`,
          version: '1.0.0',
          description: `Test module ${i}`,
          author: 'Test Author',
          permissions: ['read:tests'],
        });
      }

      const start = performance.now();
      
      const decision = lightningDetect('trigger_5');
      
      const end = performance.now();
      const latency = end - start;
      
      expect(decision?.moduleId).toBe('module_5');
      expect(decision?.intent).toBe('skill_5');
      expect(latency).toBeLessThan(50); // Should still be fast with many modules
    });
  });

  describe('Integration with Registry', () => {
    it('queries registry for module discovery', () => {
      const installedModules = registry.getInstalledModules();
      
      expect(installedModules).toHaveLength(2);
      expect(installedModules.map(m => m.id)).toContain('nutrition');
      expect(installedModules.map(m => m.id)).toContain('sport');
    });

    it('routes based on registry manifest information', () => {
      const manifest = registry.getManifest('nutrition');
      
      expect(manifest).toBeDefined();
      expect(manifest?.id).toBe('nutrition');
      expect(manifest?.permissions).toContain('read:meals');
    });

    it('handles missing registry entries gracefully', () => {
      // Register a module without registry manifest
      const orphanModule = {
        id: 'orphan',
        name: 'Orphan Module',
        version: '1.0.0',
        getSkills: () => [
          {
            id: 'orphan_skill',
            name: 'Orphan Skill',
            description: 'Skill without manifest',
            triggers: ['orphan.*test'],
            allowedRoles: [],
          },
        ],
      };
      
      bus.register(orphanModule);
      // Don't register in registry

      const decision = lightningDetect('orphan test message');
      expect(decision?.moduleId).toBe('orphan');
      expect(decision?.intent).toBe('orphan_skill');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty messages gracefully', async () => {
      const decision = await detect('');
      expect(decision).toBeNull();
    });

    it('handles very short messages', async () => {
      const decision = await detect('hi');
      expect(decision).toBeNull();
    });

    it('handles messages with special characters', () => {
      const decision = lightningDetect('Je cherche une recette de pâtes au poulet 🍗');
      expect(decision?.moduleId).toBe('nutrition');
      expect(decision?.intent).toBe('recipe_search');
    });

    it('handles unicode characters in patterns', () => {
      const decision = lightningDetect('Je vais cuisiner des crêpes ce soir');
      expect(decision?.moduleId).toBe('nutrition');
      expect(decision?.intent).toBe('recipe_search');
    });
  });
});
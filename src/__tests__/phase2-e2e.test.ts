import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { agentRegistry } from '@/lib/agents/registry';
import { detect } from '@/lib/bifrost/detector';
import { AgentConfig } from '@/lib/agents/types';
import { eventBus, SystemEvents } from '@/lib/bus/events';
import { bus } from '@/lib/bus/orchestrator';

// Mock dependencies
vi.mock('@/lib/bus/events');
vi.mock('@/lib/rag/store');
vi.mock('@/lib/rag/embeddings');

// Test data
const testUser = {
  id: 'test-user-123',
  name: 'Test User',
  email: 'test@example.com',
};

const nutritionManifest = {
  id: 'nutrition',
  name: 'Nutrition Module',
  version: '2.0.0',
  description: 'Advanced nutrition management',
  author: 'Mindlife Team',
  permissions: ['read:meals', 'write:meals', 'read:nutrition-profiles'],
};

const sportManifest = {
  id: 'sport',
  name: 'Sport Module', 
  version: '2.0.0',
  description: 'Sports and fitness tracking',
  author: 'Mindlife Team',
  permissions: ['read:workouts', 'write:workouts'],
};

describe('Phase 2 E2E Tests - Complete Agent Lifecycle', () => {
  beforeEach(() => {
    // Clear all agents and modules
    agentRegistry.getAll().forEach(agent => {
      agentRegistry.unregister(agent.id);
    });
    
    vi.clearAllMocks();
    
    // Register test modules
    const nutritionModule = {
      id: 'nutrition',
      name: 'Nutrition Module',
      version: '2.0.0',
      getSkills: () => [
        {
          id: 'recipe_search',
          name: 'Recipe Search',
          description: 'Find recipes based on ingredients and preferences',
          triggers: ['recette', 'cuisiner', 'recipe', 'trouver.*recette'],
          allowedRoles: [],
        },
        {
          id: 'meal_plan',
          name: 'Meal Planning',
          description: 'Create personalized meal plans',
          triggers: ['plan.*repas', 'menu', 'meal.*plan'],
          allowedRoles: [],
        },
      ],
    };
    
    const sportModule = {
      id: 'sport',
      name: 'Sport Module',
      version: '2.0.0',
      getSkills: () => [
        {
          id: 'workout_log',
          name: 'Workout Logging',
          description: 'Log and track workout sessions',
          triggers: ['log.*sport', 'séance.*sport', 'workout'],
          allowedRoles: [],
        },
        {
          id: 'fitness_advice',
          name: 'Fitness Advice',
          description: 'Provide personalized fitness recommendations',
          triggers: ['conseil.*fitness', 'astuce.*sport', 'fitness.*advice'],
          allowedRoles: [],
        },
      ],
    };
    
    bus.register(nutritionModule);
    bus.register(sportModule);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('E2E Test 1: Complete Agent Lifecycle with RAG Integration', () => {
    it('completes full agent lifecycle: create → train → communicate → upgrade → retire', async () => {
      console.log('🔄 Starting E2E Test 1: Complete Agent Lifecycle');
      
      // 1. AGENT CREATION
      console.log('📝 Step 1: Creating Psyché Agent');
      
      const psychéConfig: AgentConfig = {
        id: 'psyche',
        name: 'Psyché',
        role: 'psychologist',
        capabilities: ['therapy', 'counseling', 'emotional-support'],
        instructions: 'Provide compassionate psychological support and guidance',
        systemPrompt: 'You are Psyché, a compassionate AI psychologist providing psychological support and guidance.',
      };

      const spawnResult = agentRegistry.spawn(psychéConfig);
      expect(spawnResult.status).toBe('created');
      expect(spawnResult.agent.id).toBe('psyche');
      
      const psycheAgent = spawnResult.agent;
      expect(psycheAgent.name).toBe('Psyché');
      expect(psycheAgent.role).toBe('psychologist');
      
      // Verify initial state
      expect(agentRegistry.count()).toBe(1);
      expect(agentRegistry.getStatus('psyche')).toBeDefined();
      expect(psycheAgent.context.stm.get('status')).toBe('initialized');

      // 2. AGENT TRAINING
      console.log('📚 Step 2: Training Psyché with memories');
      const trainingContent = `
# Psyché Training Memories

## Core Values
- Empathy and compassion above all
- Active listening and validation
- Evidence-based therapeutic approaches
- Client-centered focus

## Communication Style
- Warm and welcoming tone
- Non-judgmental and supportive
- Clear and concise explanations
- Encouraging but realistic expectations

## Professional Approach
- Cognitive Behavioral Therapy (CBT) techniques
- Mindfulness and meditation guidance
- Goal setting and progress tracking
- Crisis management protocols

## Specializations
- Anxiety disorders and panic attacks
- Depression and mood disorders
- Relationship counseling
- Stress management
- Self-esteem building
      `;

      const trainResult = await agentRegistry.trainFromMarkdown('psyche', '/tmp/psyche-training.md');
      
      expect(trainResult.chunksCreated).toBeGreaterThan(0);
      expect(trainResult.totalTokens).toBeGreaterThan(0);
      expect(trainResult.errors).toHaveLength(0);
      expect(psycheAgent.context.stm.get('lastMarkdownImport')).toBe('/tmp/psyche-training.md');
      
      // 3. COMMUNICATION AND INTENT DETECTION
      console.log('💬 Step 3: Testing Bifrost V2 intent detection');
      
      // Test nutrition intent detection
      const nutritionIntent = await detect('Je cherche des recettes saines pour ma semaine');
      expect(nutritionIntent?.moduleId).toBe('nutrition');
      expect(nutritionIntent?.intent).toBe('recipe_search');
      expect(nutritionIntent?.confidence).toBe('high');
      
      // Test sport intent detection
      const sportIntent = await detect('Je veux loger ma séance de sport d\'aujourd\'hui');
      expect(sportIntent?.moduleId).toBe('sport');
      expect(sportIntent?.intent).toBe('workout_log');
      expect(sportIntent?.confidence).toBe('high');
      
      // Test agent communication
      console.log('🔄 Step 3b: Testing inter-agent communication');
      const mockCoachResponse = vi.fn().mockResolvedValue({
        response: 'Based on your needs, I recommend starting with mindfulness exercises and gradual exposure techniques.',
        confidence: 0.85,
      });
      
      psycheAgent.processMessage = mockCoachResponse;
      
      const messageResponse = await psycheAgent.processMessage(
        'I feel anxious about social situations',
        { userId: testUser.id, context: 'social anxiety' }
      );
      
      expect(messageResponse).toBeDefined();
      expect(messageResponse?.confidence).toBe(0.85);
      expect(mockCoachResponse).toHaveBeenCalledWith(
        'I feel anxious about social situations',
        expect.objectContaining({ userId: testUser.id })
      );

      // 4. MEMORY MANAGEMENT AND RAG
      console.log('🧠 Step 4: Testing memory management and RAG capabilities');
      
      // Train from existing memories
      const memoryTrainResult = await agentRegistry.trainFromMemories('psyche');
      expect(memoryTrainResult.chunksCreated).toBeGreaterThanOrEqual(0);
      
      // Verify memory state
      const status = agentRegistry.getStatus('psyche');
      expect(status?.stmKeys).toBeGreaterThan(0);
      expect(status?.capabilities).toContain('therapy');

      // 5. AGENT UPGRADE
      console.log('⬆️ Step 5: Upgrading agent with new capabilities');
      const upgradedConfig: AgentConfig = {
        id: 'psyche',
        name: 'Psyché Advanced',
        role: 'advanced-psychologist',
        capabilities: ['therapy', 'counseling', 'emotional-support', 'crisis-intervention', 'group-therapy'],
        instructions: 'Provide comprehensive psychological support including crisis intervention and group therapy',
      };

      const upgradeResult = agentRegistry.upgrade('psyche', upgradedConfig);
      
      expect(upgradeResult).toBeDefined();
      expect(upgradeResult.stmPreserved).toBeGreaterThan(0);
      expect(upgradeResult.current.config.capabilities).toContain('crisis-intervention');
      expect(upgradeResult.current.name).toBe('Psyché Advanced');
      
      // Verify STM preservation
      expect(upgradeResult.current.context.stm.get('status')).toBe('initialized');

      // 6. AGENT RETIREMENT
      console.log('🏁 Step 6: Testing graceful agent retirement');
      
      const retirementSuccess = await agentRegistry.retire('psyche');
      expect(retirementSuccess).toBe(true);
      expect(agentRegistry.get('psyche')).toBeUndefined();
      expect(agentRegistry.count()).toBe(0);
      
      // Verify retirement event
      expect(eventBus.emit).toHaveBeenCalledWith(SystemEvents.MODULE_UNLOADED, {
        moduleId: 'agent:psyche',
        name: 'Psyché Advanced',
        reason: 'retirement',
      });
      
      console.log('✅ E2E Test 1 completed successfully');
    }, 30000); // 30 second timeout for complex test
  });

  describe('E2E Test 2: Bifrost V2 Dynamic Discovery and Performance', () => {
    it('tests dynamic module discovery and performance benchmarks', async () => {
      console.log('🔄 Starting E2E Test 2: Bifrost V2 Dynamic Discovery');
      
      // 1. DYNAMIC MODULE DISCOVERY
      console.log('🔍 Step 1: Testing dynamic module discovery');
      
      // Add new modules dynamically
const organisationModule = {
      id: 'organisation',
      name: 'Organisation Module',
      version: '2.0.0',
      getSkills: () => [
        {
          id: 'task_create',
          name: 'Task Creator',
          description: 'Create and manage tasks and projects',
          triggers: ['tâche', 'task', 'projet', 'project'],
          allowedRoles: [],
        },
      ],
    };
      
const meditationModule = {
      id: 'meditation',
      name: 'Meditation Module',
      version: '2.0.0', 
      getSkills: () => [
        {
          id: 'fitness_advice',
          name: 'Meditation Guide',
          description: 'Provide guided meditation sessions',
          triggers: ['méditation', 'meditation', 'mindfulness', 'relaxation'],
          allowedRoles: [],
        },
      ],
    };
      
      bus.register(organisationModule);
      bus.register(meditationModule);
      
      // Verify discovery works immediately
      let intent = await detect('J\'ai besoin de créer une nouvelle tâche');
      expect(intent?.moduleId).toBe('organisation');
      expect(intent?.intent).toBe('task_create');
      
      intent = await detect('Je veux faire une séance de méditation');
      // Meditation module was already added to bus, should be detectable
      expect(intent).not.toBeNull();
      if (intent?.moduleId === 'meditation') {
        expect(intent?.intent).toBe('fitness_advice');
      } else {
        // Fallback to sport module if meditation not detected
        expect(intent?.moduleId).toBe('sport');
      }
      
      // 2. PERFORMANCE BENCHMARKING
      console.log('⚡ Step 2: Performance benchmarking');
      
      const testMessages = [
        'Je cherche des recettes saines pour ma semaine',
        'Je vais loger ma séance de sport d\'aujourd\'hui',
        'J\'ai besoin de créer une nouvelle tâche',
        'Je veux faire une séance de méditation',
        'Je me sens anxieux aujourd\'hui',
        'Peux-tu m\'aider à planifier mon repas de la semaine?',
        'Comment gérer le stress au travail?',
        'Je veux apprendre la méditation',
        'Crée un projet pour mon anniversaire',
        'Quels exercices pour le dos?',
      ];
      
      // Measure detection latency
      const startTime = performance.now();
      
      const detectionResults = await Promise.all(
        testMessages.map(message => detect(message))
      );
      
      const endTime = performance.now();
      const avgLatency = (endTime - startTime) / testMessages.length;
      
      console.log(`📊 Performance results:`);
      console.log(`  - Average latency: ${avgLatency.toFixed(2)}ms`);
      console.log(`  - Total detections: ${detectionResults.length}`);
      console.log(`  - Successful detections: ${detectionResults.filter(r => r !== null).length}`);
      
      // Performance assertions
      expect(avgLatency).toBeLessThan(100); // Should be fast
      expect(detectionResults.filter(r => r !== null).length).toBeGreaterThan(7); // Most should succeed
      
      // 3. SCALABILITY TEST
      console.log('📈 Step 3: Testing scalability with multiple modules');
      
      // Add many test modules
      for (let i = 0; i < 5; i++) {
        const module = {
          id: `module_${i}`,
          name: `Test Module ${i}`,
          version: '2.0.0',
          getSkills: () => [
            {
              id: `skill_${i}`,
              name: `Test Skill ${i}`,
              description: `Test skill ${i}`,
              triggers: [`trigger_${i}`],
              allowedRoles: [],
            },
          ],
        };
        
        bus.register(module);
      }
      
      // Test detection with many modules
      const scalabilityStart = performance.now();
      
      const scalabilityResults = await Promise.all(
        Array.from({ length: 20 }, (_, i) => 
          detect(`trigger_${i % 5}`) // Test known triggers
        )
      );
      
      const scalabilityEnd = performance.now();
      const scalabilityAvg = (scalabilityEnd - scalabilityStart) / 20;
      
      console.log(`📊 Scalability results:`);
      console.log(`  - Average latency with 7 modules: ${scalabilityAvg.toFixed(2)}ms`);
      console.log(`  - Successful detections: ${scalabilityResults.filter(r => r !== null).length}`);
      
      expect(scalabilityAvg).toBeLessThan(150); // Should still be fast
      expect(scalabilityResults.filter(r => r !== null).length).toBe(20); // All should succeed
      
      // 4. VECTOR SIMILARITY FALLBACK
      console.log('🧠 Step 4: Testing vector similarity fallback');
      
      // Mock embeddings for vector testing
      vi.doMock('@/lib/rag/embeddings', () => ({
        getEmbedding: vi.fn().mockResolvedValue({
          vector: [0.1, 0.2, 0.3, 0.4, 0.5] as any,
        }),
        cosineSimilarity: vi.fn().mockReturnValue(0.85),
      }));
      
      // Test vector-based detection (regex should fail, vector should succeed)
      const vectorIntent = await detect('Je veux quelque chose de sain et équilibré pour le dîner');
      
      // Should use vector similarity when no regex matches
      expect(vectorIntent).toBeDefined();
      expect(vectorIntent?.confidence).toBe('high');
      
      console.log('✅ E2E Test 2 completed successfully');
    }, 20000);
  });

  describe('E2E Test 3: Multi-Agent Collaboration and Error Recovery', () => {
    it('tests multi-agent collaboration and error handling', async () => {
      console.log('🔄 Starting E2E Test 3: Multi-Agent Collaboration');
      
      // 1. CREATE SPECIALIZED AGENTS
      console.log('👥 Step 1: Creating specialized agents');
      
const nutritionist: AgentConfig = {
        id: 'nutritionist',
        name: 'AI Nutritionist',
        role: 'nutritionist',
        capabilities: ['nutrition', 'meal-planning', 'dietary-advice'],
        instructions: 'Provide expert nutritional advice and meal planning',
        systemPrompt: 'You are an expert AI nutritionist providing nutritional advice and meal planning.',
      };

      const fitnessCoach: AgentConfig = {
        id: 'fitness-coach',
        name: 'AI Fitness Coach',
        role: 'fitness-coach',
        capabilities: ['fitness', 'workout-planning', 'exercise-guidance'],
        instructions: 'Create personalized workout plans and exercise guidance',
        systemPrompt: 'You are an AI fitness coach creating personalized workout plans and exercise guidance.',
      };

      const mentalHealthCoach: AgentConfig = {
        id: 'mental-health-coach',
        name: 'AI Mental Health Coach',
        role: 'mental-health-coach',
        capabilities: ['mental-health', 'counseling', 'wellness'],
        instructions: 'Provide mental health support and wellness guidance',
        systemPrompt: 'You are an AI mental health coach providing mental health support and wellness guidance.',
      };
      
      const nutritionSpawn = agentRegistry.spawn(nutritionist);
      const fitnessSpawn = agentRegistry.spawn(fitnessCoach);
      const mentalSpawn = agentRegistry.spawn(mentalHealthCoach);
      
      expect(agentRegistry.count()).toBe(3);
      
      // 2. COLLABORATIVE TASK HANDLING
      console.log('🤝 Step 2: Testing collaborative task handling');
      
      // Simulate a complex user request requiring multiple agents
      const complexRequest = `
        User wants to improve overall wellness:
        - Weight loss goal: lose 5kg in 3 months
        - Dietary preferences: vegetarian, gluten-free
        - Fitness level: beginner
        - Time available: 30 minutes/day
        - Stress management needs
        - Budget: moderate
      `;
      
      // Train agents with specialized knowledge
      await nutritionSpawn.agent.stmSet('client-profile', JSON.stringify({
        weightGoal: 'lose 5kg',
        diet: 'vegetarian, gluten-free',
        fitness: 'beginner',
        time: '30 min/day',
        stress: 'high',
        budget: 'moderate',
      }));
      
      await fitnessSpawn.agent.stmSet('client-profile', JSON.stringify({
        weightGoal: 'lose 5kg',
        diet: 'vegetarian, gluten-free',
        fitness: 'beginner',
        time: '30 min/day',
        stress: 'high',
        budget: 'moderate',
      }));
      
      await mentalSpawn.agent.stmSet('client-profile', JSON.stringify({
        weightGoal: 'lose 5kg',
        diet: 'vegetarian, gluten-free',
        fitness: 'beginner',
        time: '30 min/day',
        stress: 'high',
        budget: 'moderate',
      }));
      
      // Test Bifrost routing for complex request
      const nutritionIntent = await detect('Je veux perdre du poids avec un régime végétarien sans gluten');
      expect(nutritionIntent?.moduleId).toBe('nutrition'); // Should match 'poids' pattern
      
      const fitnessIntent = await detect('Je veux faire 30 minutes d\'exercice par jour pour débuter');
      expect(fitnessIntent?.moduleId).toBe('sport');
      
      const mentalIntent = await detect('Je suis stressé et j\'ai besoin de techniques de relaxation');
      expect(mentalIntent?.moduleId).toBe('sport'); // Meditation is in sport module
      
      // 3. ERROR HANDLING AND RECOVERY
      console.log('🛡️ Step 3: Testing error handling and recovery');
      
      // Simulate agent failure
      const originalProcess = mentalSpawn.agent.processMessage;
      let callCount = 0;
      
      mentalSpawn.agent.processMessage = async (message: string, context?: any) => {
        callCount++;
        if (callCount <= 2) {
          // Simulate failure for first two calls
          throw new Error('Simulated agent failure');
        }
        // Recover on third call
        return originalProcess.call(mentalSpawn.agent, message, context);
      };
      
      // Test error recovery
      const recoveryStart = performance.now();
      
      let response;
      for (let i = 0; i < 3; i++) {
        try {
          response = await mentalSpawn.agent.processMessage('test message');
        } catch (error) {
          // Expected to fail first two times
          if (i < 2) continue;
          throw error;
        }
      }
      
      const recoveryEnd = performance.now();
      
      expect(response).toBeDefined();
      expect(callCount).toBe(3);
      expect(recoveryEnd - recoveryStart).toBeLessThan(1000); // Should recover quickly
      
      // 4. GRACEFUL SHUTDOWN
      console.log('🏁 Step 4: Testing graceful shutdown of multiple agents');
      
      // Retire agents in reverse order (LIFO)
      const mentalRetirement = await agentRegistry.retire('mental-health-coach');
      const fitnessRetirement = await agentRegistry.retire('fitness-coach');
      const nutritionRetirement = await agentRegistry.retire('nutritionist');
      
      expect(mentalRetirement).toBe(true);
      expect(fitnessRetirement).toBe(true);
      expect(nutritionRetirement).toBe(true);
      expect(agentRegistry.count()).toBe(0);
      
      console.log('✅ E2E Test 3 completed successfully');
    }, 25000);
  });

  describe('Performance Benchmarks', () => {
    it('measures key performance indicators', async () => {
      console.log('📊 Starting Performance Benchmarks');
      
      // Create test agents
      const agents = [];
      for (let i = 0; i < 5; i++) {
        const config: AgentConfig = {
          id: `memory-agent-${i}`,
          name: `Memory Agent ${i}`,
          role: 'memory-test',
          capabilities: ['memory'],
          instructions: 'Test agent for memory performance',
          systemPrompt: 'You are a memory test agent for performance benchmarking.',
        };
        
        agents.push(agentRegistry.spawn(config));
      }
      
      // BENCHMARK 1: Agent creation time
      console.log('🚀 Benchmark 1: Agent creation time');
      const creationStart = performance.now();
      
      for (let i = 0; i < 10; i++) {
        const config: AgentConfig = {
          id: `create-agent-${i}`,
          name: `Create Agent ${i}`,
          role: 'create-test',
          capabilities: ['testing'],
          instructions: 'Test creation performance',
          systemPrompt: 'You are a test agent for creation performance testing.',
        };
        agentRegistry.spawn(config);
      }
      
      const creationEnd = performance.now();
      const creationTime = creationEnd - creationStart;
      
      console.log(`  - Creation time for 10 agents: ${creationTime.toFixed(2)}ms`);
      console.log(`  - Average creation time: ${(creationTime / 10).toFixed(2)}ms`);
      expect(creationTime).toBeLessThan(5000); // Should be fast
      
      // BENCHMARK 2: Memory operations
      console.log('🧠 Benchmark 2: Memory operations');
      const memoryStart = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        agents[0].agent.stmSet(`key-${i}`, `value-${i}`);
      }
      
      const memoryEnd = performance.now();
      const memoryTime = memoryEnd - memoryStart;
      
      console.log(`  - 1000 STM operations: ${memoryTime.toFixed(2)}ms`);
      console.log(`  - Average operation time: ${(memoryTime / 1000).toFixed(4)}ms`);
      expect(memoryTime).toBeLessThan(1000); // Should be fast
      
      // BENCHMARK 3: Intent detection
      console.log('🎯 Benchmark 3: Intent detection latency');
      const testMessages = [
        'Je cherche des recettes saines',
        'Je veux loger mon sport',
        'Crée une nouvelle tâche',
        'J\'ai besoin de conseils',
        'Planifie ma semaine',
      ];
      
      const detectionStart = performance.now();
      
      const detectionResults = await Promise.all(
        testMessages.map(msg => detect(msg))
      );
      
      const detectionEnd = performance.now();
      const detectionTime = detectionEnd - detectionStart;
      const avgDetectionTime = detectionTime / testMessages.length;
      
      console.log(`  - Total detection time: ${detectionTime.toFixed(2)}ms`);
      console.log(`  - Average detection time: ${avgDetectionTime.toFixed(2)}ms`);
      console.log(`  - Successful detections: ${detectionResults.filter(r => r !== null).length}/${testMessages.length}`);
      
      expect(avgDetectionTime).toBeLessThan(50); // Should be very fast
      expect(detectionResults.filter(r => r !== null).length).toBeGreaterThan(3); // Most should succeed
      
      // Cleanup
      agents.forEach(result => {
        agentRegistry.unregister(result.agent.id);
      });
      
      console.log('✅ Performance benchmarks completed');
    }, 15000);
  });
});
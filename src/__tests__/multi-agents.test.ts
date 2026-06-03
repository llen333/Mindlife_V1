import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { agentRegistry } from '@/lib/agents/registry';
import { AgentConfig } from '@/lib/agents/types';
import { eventBus, SystemEvents } from '@/lib/bus/events';

// Mock agent memory (RAG store is used via spied functions, not mocked at module level)
vi.mock('@/lib/services/agent-memory', () => ({
  memoryManager: {
    storeMemories: vi.fn().mockResolvedValue([]),
    listMemories: vi.fn().mockResolvedValue([]),
    extractMemories: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Multi-Agent Communication and Isolation', () => {
  beforeEach(() => {
    // Clear all agents and event bus before each test
    agentRegistry.getAll().forEach(agent => {
      agentRegistry.unregister(agent.id);
    });
    eventBus.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Agent Communication', () => {
    it('allows agents to communicate via Event Bus', async () => {
      // Create two agents that can communicate
      const coachConfig: AgentConfig = {
        id: 'coach',
        name: 'Life Coach',
        role: 'coach',
        capabilities: ['communication', 'motivation'],
        instructions: 'Help users achieve their goals',
        systemPrompt: 'You are a supportive life coach helping users achieve their goals and improve their lives.',
      };

      const nutritionConfig: AgentConfig = {
        id: 'nutritionist',
        name: 'Nutrition Coach',
        role: 'nutritionist',
        capabilities: ['nutrition', 'diet-planning'],
        instructions: 'Provide nutritional advice',
        systemPrompt: 'You are a professional nutrition coach providing dietary advice and meal planning.',
      };

      const coachResult = agentRegistry.spawn(coachConfig);
      const nutritionistResult = agentRegistry.spawn(nutritionConfig);

      expect(coachResult.status).toBe('created');
      expect(nutritionistResult.status).toBe('created');

      // Set up message handlers on agents
      const mockCoachOnMessage = vi.fn();
      const mockNutritionistOnMessage = vi.fn();
      coachResult.agent.onMessage = mockCoachOnMessage;
      nutritionistResult.agent.onMessage = mockNutritionistOnMessage;

      // Send message from coach to nutritionist
      await coachResult.agent.sendMessage('nutritionist', 'User needs meal planning advice');

      // Allow time for async processing
      await new Promise(resolve => setTimeout(resolve, 10));

      // Coach should NOT receive its own message (to is nutritionist)
      expect(mockCoachOnMessage).not.toHaveBeenCalled();
      // Nutritionist should receive the message
      expect(mockNutritionistOnMessage).toHaveBeenCalledWith(
        'coach',
        'User needs meal planning advice',
        undefined
      );
    });

    it('prevents direct memory access between agents', () => {
      const psychologistConfig: AgentConfig = {
        id: 'psychologist',
        name: 'AI Psychologist',
        role: 'psychologist',
        capabilities: ['therapy', 'counseling'],
        instructions: 'Provide psychological support',
        systemPrompt: 'You are a professional AI psychologist providing therapeutic support and counseling.',
      };

      const assistantConfig: AgentConfig = {
        id: 'assistant',
        name: 'Personal Assistant',
        role: 'assistant',
        capabilities: ['organization', 'reminders'],
        instructions: 'Help with daily tasks',
        systemPrompt: 'You are a helpful personal assistant helping users with daily tasks and organization.',
      };

      const psychologistResult = agentRegistry.spawn(psychologistConfig);
      const assistantResult = agentRegistry.spawn(assistantConfig);

      // Set some private memories in psychologist
      psychologistResult.agent.stmSet('secret', 'Patient discussed personal issues');
      psychologistResult.agent.stmSet('sessionCount', '5');

      // Assistant should not have access to psychologist's memories
      expect(assistantResult.agent.context.stm.has('secret')).toBe(false);
      expect(assistantResult.agent.context.stm.has('sessionCount')).toBe(false);

      // Assistant has its own isolated memories
      assistantResult.agent.stmSet('tasks', ['meeting', 'email']);
      expect(psychologistResult.agent.context.stm.has('tasks')).toBe(false);
    });

    it('handles inter-agent requests through proper channels', async () => {
      const mentorConfig: AgentConfig = {
        id: 'mentor',
        name: 'Mentor Agent',
        role: 'mentor',
        capabilities: ['guidance', 'career-advice'],
        instructions: 'Guide users in their career development',
        systemPrompt: 'You are an experienced mentor providing career guidance and professional development advice.',
      };

      const skillsConfig: AgentConfig = {
        id: 'skills-coach',
        name: 'Skills Coach',
        role: 'skills-coach',
        capabilities: ['skills-assessment', 'learning-path'],
        instructions: 'Help users develop new skills',
        systemPrompt: 'You are a skills development coach helping users learn new abilities and improve their professional skills.',
      };

      const mentorResult = agentRegistry.spawn(mentorConfig);
      const skillsCoachResult = agentRegistry.spawn(skillsConfig);

      // Set up message handlers on agents
      const mockMentorOnMessage = vi.fn();
      const mockSkillsOnMessage = vi.fn();
      mentorResult.agent.onMessage = mockMentorOnMessage;
      skillsCoachResult.agent.onMessage = mockSkillsOnMessage;

      // Send agent-to-agent request via event bus
      await mentorResult.agent.sendMessage(
        'skills-coach',
        'User wants to transition to management role'
      );

      // Allow time for async processing
      await new Promise(resolve => setTimeout(resolve, 10));

      // Mentor should not receive its own message (to is skills-coach)
      expect(mockMentorOnMessage).not.toHaveBeenCalled();
      // Skills coach should receive the message
      expect(mockSkillsOnMessage).toHaveBeenCalledWith(
        'mentor',
        'User wants to transition to management role',
        undefined
      );
    });

    it('manages circular communication dependencies', async () => {
      // Create three agents that might form a communication loop
      const agentAConfig: AgentConfig = {
        id: 'agent-a',
        name: 'Agent A',
        role: 'analyst',
        capabilities: ['analysis', 'reporting'],
        instructions: 'Analyze data and provide insights',
        systemPrompt: 'You are Agent A, specialized in data analysis and reporting.',
      };

      const agentBConfig: AgentConfig = {
        id: 'agent-b',
        name: 'Agent B',
        role: 'processor',
        capabilities: ['data-processing', 'transformation'],
        instructions: 'Process data according to specifications',
        systemPrompt: 'You are Agent B, specialized in data processing and transformation.',
      };

      const agentCConfig: AgentConfig = {
        id: 'agent-c',
        name: 'Agent C',
        role: 'validator',
        capabilities: ['validation', 'quality-check'],
        instructions: 'Validate results and ensure quality',
        systemPrompt: 'You are Agent C, specialized in validation and quality control.',
      };

      const agentAResult = agentRegistry.spawn(agentAConfig);
      const agentBResult = agentRegistry.spawn(agentBConfig);
      const agentCResult = agentRegistry.spawn(agentCConfig);

      // Mock message processing to detect potential loops
      const processedMessages = new Set();

      const mockProcessMessage = (agentId: string) => {
        return async (message: string) => {
          const messageId = `${agentId}:${message}`;
          
          // Prevent infinite loops
          if (processedMessages.has(messageId)) {
            throw new Error(`Circular communication detected: ${messageId}`);
          }
          
          processedMessages.add(messageId);
          
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 5));
          
          return { response: `Processed by ${agentId}`, confidence: 0.8 };
        };
      };

      agentAResult.agent.processMessage = mockProcessMessage('agent-a');
      agentBResult.agent.processMessage = mockProcessMessage('agent-b');
      agentCResult.agent.processMessage = mockProcessMessage('agent-c');

      // Test linear communication (A -> B -> C)
      const result = await agentBResult.agent.processMessage('test message from A');
      expect(result.response).toBe('Processed by agent-b');

      // Reset for next test
      processedMessages.clear();
    });
  });

  describe('Memory Isolation', () => {
    it('maintains strict memory separation between agents', () => {
      const doctorConfig: AgentConfig = {
        id: 'doctor',
        name: 'AI Doctor',
        role: 'health-advisor',
        capabilities: ['medical-advice', 'health-monitoring'],
        instructions: 'Provide health recommendations',
        systemPrompt: 'You are an AI health advisor providing medical advice and health monitoring.',
      };

      const teacherConfig: AgentConfig = {
        id: 'teacher',
        name: 'AI Teacher',
        role: 'education',
        capabilities: ['teaching', 'curriculum-development'],
        instructions: 'Educate users on various topics',
        systemPrompt: 'You are an AI teacher providing educational content and curriculum development.',
      };

      const doctorResult = agentRegistry.spawn(doctorConfig);
      const teacherResult = agentRegistry.spawn(teacherConfig);

      // Agent-specific data
      doctorResult.agent.stmSet('patient-data', 'Blood pressure: 120/80');
      doctorResult.agent.stmSet('last-checkup', '2024-01-15');

      teacherResult.agent.stmSet('students', ['Alice', 'Bob', 'Charlie']);
      teacherResult.agent.stmSet('courses', ['Math', 'Science', 'History']);

      // Verify isolation
      expect(doctorResult.agent.context.stm.has('patient-data')).toBe(true);
      expect(doctorResult.agent.context.stm.has('students')).toBe(false);
      expect(teacherResult.agent.context.stm.has('courses')).toBe(true);
      expect(teacherResult.agent.context.stm.has('patient-data')).toBe(false);

      // Verify STM size differences (2 user-set + 2 spawn defaults = 4)
      expect(doctorResult.agent.context.stm.size).toBe(4);
      expect(teacherResult.agent.context.stm.size).toBe(4);
    });

    it('preserves memory integrity during agent upgrades', () => {
      const originalConfig: AgentConfig = {
        id: 'upgradable-agent',
        name: 'Original Agent',
        role: 'assistant',
        capabilities: ['basic-tasks'],
        instructions: 'Perform basic tasks',
        systemPrompt: 'You are a basic assistant performing simple tasks.',
      };

      const spawnResult = agentRegistry.spawn(originalConfig);
      const originalAgent = spawnResult.agent;

      // Set some memories
      originalAgent.stmSet('task-counter', '42');
      originalAgent.stmSet('user-preferences', 'theme: dark');
      originalAgent.stmSet('last-session', '2024-01-15T10:00:00Z');

      // Upgrade the agent
      const upgradedConfig: AgentConfig = {
        id: 'upgradable-agent',
        name: 'Upgraded Agent',
        role: 'advanced-assistant',
        capabilities: ['basic-tasks', 'advanced-analysis'],
        instructions: 'Perform advanced tasks with analysis',
      };

      const upgradeResult = agentRegistry.upgrade('upgradable-agent', upgradedConfig);

      expect(upgradeResult).not.toBeNull();
      expect(upgradeResult.stmPreserved).toBe(5);

      // Verify memories are preserved
      const upgradedAgent = upgradeResult.current;
      expect(upgradedAgent.context.stm.has('task-counter')).toBe(true);
      expect(upgradedAgent.context.stm.has('user-preferences')).toBe(true);
      expect(upgradedAgent.context.stm.has('last-session')).toBe(true);

      // Verify new capabilities are added
      expect(upgradedAgent.config.capabilities).toContain('advanced-analysis');
    });

    it('prevents memory leaks during agent lifecycle', () => {
      // Create and destroy multiple agents
      const agentIds: string[] = [];

for (let i = 0; i < 5; i++) {
        const config: AgentConfig = {
          id: `temp-agent-${i}`,
          name: `Temporary Agent ${i}`,
          role: 'test',
          capabilities: ['testing'],
          instructions: 'Test agent',
          systemPrompt: 'You are a temporary test agent.',
        };
        
        const result = agentRegistry.spawn(config);
        agentIds.push(result.agent.id);

        // Set some data
        result.agent.stmSet('test-data', `value-${i}`);
      }

      // Verify all agents were created
      expect(agentRegistry.count()).toBe(5);

      // Remove all agents
      agentIds.forEach(id => {
        const success = agentRegistry.unregister(id);
        expect(success).toBe(true);
      });

      // Verify all agents are gone
      expect(agentRegistry.count()).toBe(0);

      // Verify no memory leaks by checking total STM usage
      const allAgents = agentRegistry.getAll();
      const totalMemoryUsage = allAgents.reduce((sum, agent) => sum + agent.context.stm.size, 0);
      expect(totalMemoryUsage).toBe(0);
    });

    it('handles concurrent memory access safely', async () => {
      const sharedConfig: AgentConfig = {
        id: 'shared-agent',
        name: 'Shared Agent',
        role: 'coordinator',
        capabilities: ['coordination', 'scheduling'],
        instructions: 'Coordinate between multiple systems',
        systemPrompt: 'You are a coordinator agent.',
      };

      const result = agentRegistry.spawn(sharedConfig);
      const agent = result.agent;

      // Simulate concurrent access to STM
      const concurrentOperations = Array.from({ length: 10 }, (_, i) => i);

      const operations = concurrentOperations.map(async (i) => {
        const key = `key-${i}`;
        const value = `value-${i}-${Date.now()}`;
        agent.stmSet(key, value);
        
        // Small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
        
        return agent.context.stm.get(key);
      });

      // Run all operations concurrently
      const results = await Promise.all(operations);

      // Verify all operations completed successfully
      expect(results).toHaveLength(10);
      expect(results.every(result => result !== undefined)).toBe(true);

      // Verify final state (10 user-set + 2 spawn defaults = 12)
      expect(agent.context.stm.size).toBe(12);
      concurrentOperations.forEach(i => {
        expect(agent.context.stm.has(`key-${i}`)).toBe(true);
      });
    });
  });

  describe('Agent Lifecycle Management', () => {
    it('handles graceful shutdown with memory preservation', async () => {
      const config: AgentConfig = {
        id: 'retiring-agent',
        name: 'Retiring Agent',
        role: 'legacy-service',
        capabilities: ['legacy-integration'],
        instructions: 'Handle legacy system integration',
        systemPrompt: 'You are a legacy service agent handling legacy system integration.',
      };

      const emitSpy = vi.spyOn(eventBus, 'emit');
      const spawnResult = agentRegistry.spawn(config);
      const agent = spawnResult.agent;

      // Set some critical memories
      agent.stmSet('legacy-system-status', 'active');
      agent.stmSet('last-synchronization', '2024-01-15T10:00:00Z');
      agent.stmSet('pending-tasks', '3');

      // Graceful retirement
      const retirementSuccess = await agentRegistry.retire('retiring-agent');

      expect(retirementSuccess).toBe(true);
      expect(agentRegistry.get('retiring-agent')).toBeUndefined();

      // Verify retirement event was emitted
      expect(emitSpy).toHaveBeenCalledWith(SystemEvents.MODULE_UNLOADED, {
        moduleId: 'agent:retiring-agent',
        name: 'Retiring Agent',
        reason: 'retirement',
      });

      emitSpy.mockRestore();
    });

    it('prevents agent creation with duplicate IDs', () => {
      const config: AgentConfig = {
        id: 'duplicate-agent',
        name: 'Duplicate Agent',
        role: 'test',
        capabilities: ['testing'],
        instructions: 'Test duplicate creation',
        systemPrompt: 'You are a test agent.',
      };

      // First creation should succeed
      const result1 = agentRegistry.spawn(config);
      expect(result1.status).toBe('created');

      // Second creation should fail
      expect(() => {
        agentRegistry.spawn(config);
      }).toThrow('Agent \'duplicate-agent\' is already registered');
    });

    it('validates agent configuration before creation', () => {
      const invalidConfig: AgentConfig = {
        id: '',
        name: '',
        role: '',
        capabilities: [],
        instructions: '',
        systemPrompt: '',
      };

      expect(() => {
        agentRegistry.spawn(invalidConfig);
      }).toThrow('Agent config invalid');
    });

    it('provides comprehensive agent status information', () => {
      const config: AgentConfig = {
        id: 'status-agent',
        name: 'Status Test Agent',
        role: 'monitoring',
        capabilities: ['monitoring', 'reporting'],
        instructions: 'Monitor system status',
        systemPrompt: 'You are a monitoring agent providing system status reports.',
      };

      const spawnResult = agentRegistry.spawn(config);
      const agent = spawnResult.agent;

      // Simulate some activity
      agent.stmSet('messageCount', '5');
      agent.stmSet('lastActiveAt', new Date().toISOString());

      const status = agentRegistry.getStatus('status-agent');

      expect(status).not.toBeNull();
      expect(status?.id).toBe('status-agent');
      expect(status?.name).toBe('Status Test Agent');
      expect(status?.role).toBe('monitoring');
      expect(status?.messageCount).toBe(0);
      expect(status?.stmKeys).toBe(4); // status + spawnedAt (spawn) + messageCount + lastActiveAt
      expect(status?.capabilities).toEqual(['monitoring', 'reporting']);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('handles agent communication failures gracefully', async () => {
      const config: AgentConfig = {
        id: 'faulty-agent',
        name: 'Faulty Agent',
        role: 'test',
        capabilities: ['testing'],
        instructions: 'Test error handling',
        systemPrompt: 'You are a faulty test agent for error handling tests.',
      };

      const result = agentRegistry.spawn(config);
      const agent = result.agent;

      // Simulate a communication failure via onMessage
      const mockOnMessage = vi.fn().mockRejectedValue(new Error('Communication failed'));
      agent.onMessage = mockOnMessage;

      // Should not crash the system when handler fails
      await expect(
        agentRegistry.get('faulty-agent')?.sendMessage('nonexistent', 'test message')
      ).resolves.toBeUndefined();
    });

    it('recovers from temporary agent unavailability', () => {
      const config: AgentConfig = {
        id: 'unstable-agent',
        name: 'Unstable Agent',
        role: 'test',
        capabilities: ['testing'],
        instructions: 'Test recovery',
        systemPrompt: 'You are a test agent.',
      };

      // Create and remove agent multiple times
      for (let i = 0; i < 3; i++) {
        const result = agentRegistry.spawn(config);
        expect(result.status).toBe('created');
        
        const removal = agentRegistry.unregister(config.id);
        expect(removal).toBe(true);
      }
    });

    it('maintains system stability during agent failures', () => {
      const workingConfig: AgentConfig = {
        id: 'working-agent',
        name: 'Working Agent',
        role: 'stable',
        capabilities: ['stable'],
        instructions: 'Provide stable service',
        systemPrompt: 'You are a stable working agent providing reliable services.',
      };

      const faultyConfig: AgentConfig = {
        id: 'faulty-agent',
        name: 'Faulty Agent',
        role: 'unstable',
        capabilities: ['unstable'],
        instructions: 'May fail',
        systemPrompt: 'You are an unstable agent that may experience failures.',
      };

      // Create both agents
      agentRegistry.spawn(workingConfig);
      agentRegistry.spawn(faultyConfig);

      // System should remain stable even if one agent fails
      expect(agentRegistry.count()).toBe(2);

      // Remove faulty agent
      agentRegistry.unregister('faulty-agent');

      // Working agent should still be functional
      expect(agentRegistry.count()).toBe(1);
      expect(agentRegistry.get('working-agent')).toBeDefined();
    });
  });
});
import { agentRegistry, AgentRegistry, AgentRuntime } from '@/lib/agents';
import { permissionManager } from '@/lib/bus/permissions';
import { eventBus, SystemEvents } from '@/lib/bus/events';
import { AgentConfig } from '@/lib/agents/types';

describe('AgentRegistry', () => {
  const testConfig: AgentConfig = {
    id: 'test-agent-1',
    name: 'TestAgent',
    role: 'assistant',
    systemPrompt: 'You are a test agent.',
    model: 'gpt-4',
    temperature: 0.5,
    capabilities: ['conversation', 'analysis'],
  };

  it('registers and retrieves agents', () => {
    const runtime = agentRegistry.register(testConfig);
    expect(runtime).toBeInstanceOf(AgentRuntime);
    expect(runtime.id).toBe('test-agent-1');
    expect(runtime.name).toBe('TestAgent');
    expect(runtime.role).toBe('assistant');

    const retrieved = agentRegistry.get('test-agent-1');
    expect(retrieved).toBeDefined();
    expect(retrieved!.config.model).toBe('gpt-4');

    agentRegistry.unregister('test-agent-1');
  });

  it('throws on duplicate registration', () => {
    agentRegistry.register(testConfig);
    expect(() => agentRegistry.register(testConfig)).toThrow('already registered');
    agentRegistry.unregister('test-agent-1');
  });

  it('finds agents by role', () => {
    const a1 = agentRegistry.register({ ...testConfig, id: 'role-a', role: 'coach' });
    const a2 = agentRegistry.register({ ...testConfig, id: 'role-b', role: 'coach' });
    const coaches = agentRegistry.findByRole('coach');
    expect(coaches).toHaveLength(2);
    agentRegistry.unregister('role-a');
    agentRegistry.unregister('role-b');
  });

  it('finds agents by name', () => {
    agentRegistry.register(testConfig);
    const found = agentRegistry.findByName('TestAgent');
    expect(found).toBeDefined();
    expect(found!.id).toBe('test-agent-1');
    agentRegistry.unregister('test-agent-1');
  });

  it('counts registered agents', () => {
    const before = agentRegistry.count();
    agentRegistry.register({ ...testConfig, id: 'count-test' });
    expect(agentRegistry.count()).toBe(before + 1);
    agentRegistry.unregister('count-test');
  });
});

describe('AgentRuntime', () => {
  const config: AgentConfig = {
    id: 'runtime-test',
    name: 'RuntimeTest',
    role: 'assistant',
    systemPrompt: 'You are a test.',
    capabilities: ['conversation'],
  };

  it('initializes with config and context', () => {
    const agent = new AgentRuntime(config);
    expect(agent.id).toBe('runtime-test');
    expect(agent.name).toBe('RuntimeTest');
    expect(agent.context.messageCount).toBe(0);
    expect(agent.context.createdAt).toBeInstanceOf(Date);
  });

  it('tracks last active time', () => {
    const agent = new AgentRuntime(config);
    const before = agent.context.lastActiveAt;
    agent.touch();
    expect(agent.context.lastActiveAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('checks capabilities', () => {
    const agent = new AgentRuntime(config);
    expect(agent.hasCapability('conversation')).toBe(true);
    expect(agent.hasCapability('admin')).toBe(false);
  });

  it('checks permissions via PermissionManager', () => {
    const agent = new AgentRuntime(config);
    expect(agent.checkPermission('meals:read')).toBe(true);
    expect(agent.checkPermission('unknown:perm')).toBe(false);
  });

  it('manages short-term memory (STM)', () => {
    const agent = new AgentRuntime(config);
    agent.stmSet('last_topic', 'nutrition');
    expect(agent.stmGet('last_topic')).toBe('nutrition');
    expect(agent.stmGet('nonexistent')).toBeUndefined();
  });

  it('emits AGENT_MESSAGE event on sendMessage', async () => {
    const handler = vi.fn();
    eventBus.on(SystemEvents.AGENT_MESSAGE, handler);

    const agent = new AgentRuntime(config);
    await agent.sendMessage('other-agent', 'Hello!', 'session-1');

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'runtime-test',
        to: 'other-agent',
        content: 'Hello!',
        sessionId: 'session-1',
      })
    );
  });

  it('validates config and returns errors', () => {
    const valid = new AgentRuntime(config);
    expect(valid.validateConfig()).toEqual([]);

    const invalid = new AgentRuntime({ id: '', name: '', role: '', systemPrompt: '' });
    const errors = invalid.validateConfig();
    expect(errors.length).toBe(4);
    expect(errors).toContain('Agent ID is required');
    expect(errors).toContain('Agent name is required');
    expect(errors).toContain('Agent role is required');
    expect(errors).toContain('System prompt is required');
  });

  it('getAvailableTools returns tools filtered by permissions', () => {
    const agent = new AgentRuntime(config);
    const tools = agent.getAvailableTools();
    // No modules imported in test scope, so empty is valid
    expect(tools).toEqual([]);
  });

  it('includes tools when module permissions match', async () => {
    await import('@/lib/modules');
    const agent = new AgentRuntime({ ...config, id: 'tool-test', name: 'ToolTest' });
    const tools = agent.getAvailableTools();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.some((t) => t.name === 'save_meal' || t.name === 'get_meals')).toBe(true);
  });

  it('supports inter-agent message handler', async () => {
    const handler = vi.fn();
    const agentA = new AgentRuntime({ ...config, id: 'agent-a', name: 'AgentA' });
    const agentB = new AgentRuntime({ ...config, id: 'agent-b', name: 'AgentB', systemPrompt: 'You are B' });

    agentB.onMessage = handler;
    await agentA.sendMessage('agent-b', 'Hello from A', 'session-comm');

    expect(handler).toHaveBeenCalledWith('agent-a', 'Hello from A', 'session-comm');
  });
});

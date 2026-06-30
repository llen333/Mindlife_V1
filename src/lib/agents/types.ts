export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  tone?: string;
  model?: string;
  provider?: string;
  temperature?: number;
  capabilities?: string[];
}

export interface AgentContext {
  config: AgentConfig;
  stm: Map<string, string>;
  currentSessionId?: string;
  messageCount: number;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AgentMessageEvent {
  from: string;
  to?: string;
  content: string;
  sessionId?: string;
  timestamp: Date;
}

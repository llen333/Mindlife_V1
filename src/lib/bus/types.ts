export interface MessageContext {
  message: string;
  history: { role: 'user' | 'assistant' | 'system'; content: string }[];
  sessionId?: string;
  userId?: string;
  intent?: string;
}

export interface ModuleResponse {
  success: boolean;
  content: string;
  moduleId: string;
  error?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>, context: MessageContext) => Promise<unknown>;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
}

export interface Module {
  id: string;
  name: string;
  canHandle(intent: string): boolean;
  execute(context: MessageContext): Promise<ModuleResponse>;
  getTools(): ToolDefinition[];
  getSkills(): SkillDefinition[];
}

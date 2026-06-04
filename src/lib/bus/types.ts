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
  allowedRoles?: string[];
  triggers?: string[];
}

export interface Module {
  id: string;
  name: string;
  canHandle(intent: string): boolean;
  execute(context: MessageContext): Promise<ModuleResponse>;
  getTools(): ToolDefinition[];
  getSkills(): SkillDefinition[];
  onLoad?(): void | Promise<void>;
  onUnload?(): void | Promise<void>;
  onUpgrade?(newVersion: string): void | Promise<void>;
}

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: Record<string, string>;
  permissions?: string[];
  intents?: string[];
  timeout?: number;
  rateLimit?: { maxRequests: number; windowMs: number };
  allowedPaths?: string[];
  allowNetwork?: boolean;
  maxMemoryMb?: number;
}

export interface ModuleEventMap {
  'module:loaded': { moduleId: string; name: string };
  'module:unloaded': { moduleId: string; name: string };
  'module:error': { moduleId: string; intent: string; error: string };
  'agent:message': { sessionId?: string; message: string; role: string };
  'permission:request': { moduleId: string; permission: string; reason?: string };
  'intent:detected': { intent: string; sessionId?: string };
}

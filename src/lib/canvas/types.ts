export interface PortDef {
  id: string;
  label: string;
  type: 'input' | 'output';
  acceptedType?: 'any' | 'data' | 'control' | 'event';
}

export interface BlockDef {
  type: string;
  label: string;
  icon: string;
  category: 'actions' | 'ai' | 'logic' | 'triggers' | 'tools';
  color: string;
  description: string;
  inputs: PortDef[];
  outputs: PortDef[];
  configFields: ConfigFieldDef[];
  execute: (config: Record<string, unknown>, inputs: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

export interface ConfigFieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
}

export interface CanvasBlock {
  id: string;
  type: string;
  x: number;
  y: number;
  config: Record<string, unknown>;
  label?: string;
}

export interface Connection {
  id: string;
  sourceBlockId: string;
  sourcePortId: string;
  targetBlockId: string;
  targetPortId: string;
}

export interface CanvasState {
  blocks: CanvasBlock[];
  connections: Connection[];
  selectedBlockId: string | null;
  connectingFrom: { blockId: string; portId: string } | null;
  executionState: Record<string, 'idle' | 'running' | 'success' | 'error'>;
  executionLogs: { blockId: string; message: string; type: 'info' | 'error' | 'success'; timestamp: number }[];
}

export interface ExecutionContext {
  userId: string;
  variables: Record<string, unknown>;
  onLog: (blockId: string, message: string, type: 'info' | 'error' | 'success') => void;
}

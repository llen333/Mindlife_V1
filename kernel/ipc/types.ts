export type IpcMethod =
  | 'bus.emit'
  | 'bus.route'
  | 'bus.routeTo'
  | 'bus.intent'
  | 'module.list'
  | 'module.install'
  | 'module.unload'
  | 'module.info'
  | 'module.loaded'
  | 'registry.discover'
  | 'registry.manifest'
  | 'sys.fs.read'
  | 'sys.fs.write'
  | 'sys.fs.list'
  | 'sys.fs.exists'
  | 'sys.mem.store'
  | 'sys.mem.search'
  | 'sys.mem.delete'
  | 'sys.mem.count'
  | 'sys.agent.send'
  | 'sys.agent.broadcast'
  | 'sys.agent.status'
  | 'store.register'
  | 'store.install'
  | 'store.uninstall'
  | 'store.list'
  | 'store.search'
  | 'store.get'
  | 'store.dependencies'
  | 'store.remove'
  | 'store.remote.search'
  | 'store.remote.info'
  | 'store.remote.install'
  | 'store.remote.uninstall'
  | 'store.remote.listInstalled'
  | 'store.remote.setRegistry'
  | 'runtime.sandbox.configure'
  | 'runtime.sandbox.status'
  | 'runtime.sandbox.statusAll'
  | 'runtime.sandbox.ban'
  | 'runtime.sandbox.unban'
  | 'runtime.ratelimit.status'
  | 'runtime.dlq.list'
  | 'runtime.dlq.retry'
  | 'runtime.dlq.purge'
  | 'security.token.generate'
  | 'security.token.validate'
  | 'security.token.revoke'
  | 'security.token.list'
  | 'security.permission.revoke'
  | 'security.permission.restore'
  | 'security.audit.query'
  | 'security.audit.recent'
  | 'sys.mem.promote'
  | 'memory.consolidate'
  | 'memory.status'
  | 'memory.config'
  | 'kernel.ping'
  | 'kernel.status';

export interface IpcRequest {
  type: 'request';
  id: string;
  method: IpcMethod;
  params: Record<string, unknown>;
}

export interface IpcResponse {
  type: 'response';
  id: string;
  result?: unknown;
  error?: { code: string; message: string };
}

export interface IpcEvent {
  type: 'event';
  event: string;
  payload: Record<string, unknown>;
}

export type IpcMessage = IpcRequest | IpcResponse | IpcEvent;

export interface KernelStatus {
  uptime: number;
  modules: number;
  agents: number;
  memory: number;
  connections: number;
}

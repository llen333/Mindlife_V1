import { auditLogger, type AuditEntry } from './audit';
import { eventBus } from '../../src/lib/bus/events';

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  moduleId?: string;
  ip?: string;
  action?: string;
  count: number;
  windowMs: number;
  timestamp: number;
}

export interface MonitorConfig {
  deniedThreshold: number;
  deniedWindowMs: number;
  errorThreshold: number;
  errorWindowMs: number;
  tokenFailThreshold: number;
  tokenFailWindowMs: number;
  checkIntervalMs: number;
}

const DEFAULT_CONFIG: MonitorConfig = {
  deniedThreshold: 10,
  deniedWindowMs: 300000,
  errorThreshold: 5,
  errorWindowMs: 300000,
  tokenFailThreshold: 5,
  tokenFailWindowMs: 300000,
  checkIntervalMs: 60000,
};

export class SecurityMonitor {
  private config: MonitorConfig;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private alertHistory: SecurityAlert[] = [];
  private lastCheck: number = Date.now();

  constructor(config?: Partial<MonitorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  updateConfig(partial: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...partial };
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }

  getConfig(): MonitorConfig {
    return { ...this.config };
  }

  getAlerts(limit = 20): SecurityAlert[] {
    return this.alertHistory.slice(0, limit);
  }

  start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.check().catch((e) => console.error('[SECURITY_MONITOR] Check error:', e));
    }, this.config.checkIntervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async check(): Promise<void> {
    const now = Date.now();
    const since = new Date(this.lastCheck);
    this.lastCheck = now;

    const recentEntries = await auditLogger.query({
      since,
      limit: 500,
    });

    if (recentEntries.entries.length === 0) return;

    const deniedByModule = new Map<string, number>();
    const errorsByModule = new Map<string, number>();
    const tokenFails = recentEntries.entries.filter(
      (e) => e.action === 'token.validate' && e.result === 'denied',
    );

    for (const entry of recentEntries.entries) {
      if (entry.result === 'denied' && entry.moduleId) {
        deniedByModule.set(entry.moduleId, (deniedByModule.get(entry.moduleId) || 0) + 1);
      }
      if (entry.result === 'error' && entry.moduleId) {
        errorsByModule.set(entry.moduleId, (errorsByModule.get(entry.moduleId) || 0) + 1);
      }
    }

    for (const [moduleId, count] of deniedByModule) {
      if (count >= this.config.deniedThreshold) {
        this.raiseAlert({
          type: 'excessive_denied',
          severity: count >= this.config.deniedThreshold * 2 ? 'high' : 'medium',
          message: `Module '${moduleId}' had ${count} denied permissions in ${this.config.deniedWindowMs / 60000}min`,
          moduleId,
          action: 'permission.check',
          count,
          windowMs: this.config.deniedWindowMs,
        });
      }
    }

    for (const [moduleId, count] of errorsByModule) {
      if (count >= this.config.errorThreshold) {
        this.raiseAlert({
          type: 'excessive_errors',
          severity: count >= this.config.errorThreshold * 2 ? 'high' : 'medium',
          message: `Module '${moduleId}' had ${count} errors in ${this.config.errorWindowMs / 60000}min`,
          moduleId,
          action: 'module.error',
          count,
          windowMs: this.config.errorWindowMs,
        });
      }
    }

    if (tokenFails.length >= this.config.tokenFailThreshold) {
      const ips = new Set(tokenFails.map((e) => (e.details as any)?.ip).filter(Boolean));
      this.raiseAlert({
        type: 'token_brute_force',
        severity: tokenFails.length >= this.config.tokenFailThreshold * 3 ? 'critical' : 'high',
        message: `${tokenFails.length} failed token validations in ${this.config.tokenFailWindowMs / 60000}min${ips.size > 0 ? ` from ${ips.size} IP(s)` : ''}`,
        action: 'token.validate',
        count: tokenFails.length,
        windowMs: this.config.tokenFailWindowMs,
      });
    }
  }

  private raiseAlert(params: {
    type: string;
    severity: SecurityAlert['severity'];
    message: string;
    moduleId?: string;
    ip?: string;
    action?: string;
    count: number;
    windowMs: number;
  }): void {
    const existing = this.alertHistory.find(
      (a) => a.type === params.type && a.moduleId === params.moduleId,
    );

    if (existing && Date.now() - existing.timestamp < this.config.checkIntervalMs * 2) {
      return;
    }

    const alert: SecurityAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      ...params,
    };

    this.alertHistory.unshift(alert);
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(0, 100);
    }

    eventBus.emit('security:alert', alert).catch(() => {});
  }
}

export const securityMonitor = new SecurityMonitor();

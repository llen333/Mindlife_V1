import { db } from '../../src/lib/db';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  moduleId: string;
  action: string;
  result: 'success' | 'denied' | 'error';
  details: Record<string, unknown> | null;
  ipcId: string | null;
}

export class AuditLogger {
  async log(params: {
    moduleId: string;
    action: string;
    result: 'success' | 'denied' | 'error';
    details?: Record<string, unknown>;
    ipcId?: string;
  }): Promise<string> {
    const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await db.auditLog.create({
      data: {
        id,
        moduleId: params.moduleId,
        action: params.action,
        result: params.result,
        details: params.details ? JSON.stringify(params.details) : null,
        ipcId: params.ipcId || null,
      },
    });

    return id;
  }

  async query(params: {
    moduleId?: string;
    action?: string;
    result?: string;
    since?: Date;
    until?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ entries: AuditEntry[]; total: number }> {
    const where: any = {};
    if (params.moduleId) where.moduleId = params.moduleId;
    if (params.action) where.action = params.action;
    if (params.result) where.result = params.result;
    if (params.since || params.until) {
      where.timestamp = {};
      if (params.since) where.timestamp.gte = params.since;
      if (params.until) where.timestamp.lte = params.until;
    }

    const [entries, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: params.limit || 50,
        skip: params.offset || 0,
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      entries: entries.map((e) => this.toAuditEntry(e)),
      total,
    };
  }

  async recent(limit = 20): Promise<AuditEntry[]> {
    const entries = await db.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return entries.map((e) => this.toAuditEntry(e));
  }

  async purge(olderThanDays = 90): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const result = await db.auditLog.deleteMany({
      where: { timestamp: { lt: cutoff } },
    });
    return result.count;
  }

  private toAuditEntry(e: any): AuditEntry {
    return {
      id: e.id,
      timestamp: e.timestamp,
      moduleId: e.moduleId,
      action: e.action,
      result: e.result,
      details: e.details ? JSON.parse(e.details) : null,
      ipcId: e.ipcId,
    };
  }
}

export const auditLogger = new AuditLogger();

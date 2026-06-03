import { moduleStore } from '../store/manager';
import { moduleSandbox } from '../runtime/sandbox';
import { auditLogger } from './audit';

export type PermissionString =
  | 'sys.fs.read'
  | 'sys.fs.write'
  | 'sys.fs.list'
  | 'sys.mem.store'
  | 'sys.mem.search'
  | 'sys.agent.send'
  | 'sys.agent.broadcast'
  | 'module.*'
  | 'store.*'
  | 'security.*'
  | '*';

export interface PermissionCheck {
  moduleId: string;
  permission: PermissionString;
  action: string;
  details?: Record<string, unknown>;
}

export class PermissionManager {
  private revoked: Map<string, Set<string>> = new Map();

  revokePermission(moduleId: string, permission: string): void {
    if (!this.revoked.has(moduleId)) {
      this.revoked.set(moduleId, new Set());
    }
    this.revoked.get(moduleId)!.add(permission);
  }

  restorePermission(moduleId: string, permission: string): void {
    this.revoked.get(moduleId)?.delete(permission);
  }

  revokeAll(moduleId: string): void {
    this.revoked.set(moduleId, new Set(['*']));
  }

  isRevoked(moduleId: string, permission: string): boolean {
    const revoked = this.revoked.get(moduleId);
    if (!revoked) return false;
    return revoked.has('*') || revoked.has(permission);
  }

  async check(check: PermissionCheck): Promise<{ allowed: boolean; reason?: string }> {
    const auditDetails: Record<string, unknown> = {
      permission: check.permission,
      ...check.details,
    };

    if (this.isRevoked(check.moduleId, check.permission)) {
      await auditLogger.log({
        moduleId: check.moduleId,
        action: check.action,
        result: 'denied',
        details: { ...auditDetails, reason: `Permission '${check.permission}' revoked at runtime` },
      });
      return { allowed: false, reason: `Permission '${check.permission}' revoked at runtime` };
    }

    try {
      const pkg = await moduleStore.get(check.moduleId);
      if (pkg) {
        const manifest = pkg.manifest;
        const requiredPerms: string[] = (manifest as any).permissions || [];
        const hasWildcard = requiredPerms.includes('*');
        const hasExact = requiredPerms.includes(check.permission);

        if (!hasWildcard && !hasExact) {
          await auditLogger.log({
            moduleId: check.moduleId,
            action: check.action,
            result: 'denied',
            details: { ...auditDetails, reason: `Permission '${check.permission}' not declared in manifest` },
          });
          return { allowed: false, reason: `Permission '${check.permission}' not declared in module manifest` };
        }
      }
    } catch {
      // No manifest means no static permission check — fall through
    }

    await auditLogger.log({
      moduleId: check.moduleId,
      action: check.action,
      result: 'success',
      details: auditDetails,
    });

    return { allowed: true };
  }
}

export const permissionManager = new PermissionManager();

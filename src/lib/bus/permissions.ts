import { eventBus, SystemEvents } from './events';

export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

export type PermissionString = `${string}:${string}`;

export interface PermissionCheck {
  granted: boolean;
  reason?: string;
}

const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionString[]> = {
  assistant: [
    'meals:read', 'meals:write',
    'workouts:read', 'workouts:write',
    'tasks:read', 'tasks:write', 'events:read', 'events:write',
    'web:search', 'web:scrape',
    'data:read', 'data:write', 'notes:read', 'notes:write',
  ],
  coach: [
    'workouts:read', 'workouts:write',
    'data:read', 'notes:read', 'notes:write',
  ],
  nutrition: [
    'meals:read', 'meals:write',
    'data:read', 'notes:read',
  ],
  oracle: [
    'web:search', 'web:scrape',
    'data:read', 'notes:read',
  ],
  psychologist: [
    'notes:read', 'notes:write', 'data:read',
  ],
};

export class PermissionManager {
  private rolePermissions: Map<string, Set<PermissionString>>;

  constructor(customPermissions?: Record<string, PermissionString[]>) {
    this.rolePermissions = new Map();
    const merged = { ...DEFAULT_ROLE_PERMISSIONS, ...customPermissions };
    for (const [role, perms] of Object.entries(merged)) {
      this.rolePermissions.set(role, new Set(perms));
    }
  }

  check(role: string | undefined, permission: PermissionString): PermissionCheck {
    if (!role) return { granted: true };
    const perms = this.rolePermissions.get(role);
    if (!perms) return { granted: false, reason: `Unknown role: ${role}` };
    if (perms.has(permission)) return { granted: true };
    return { granted: false, reason: `Role '${role}' lacks '${permission}'` };
  }

  checkModulePermissions(role: string | undefined, required: PermissionString[]): PermissionCheck {
    if (!role) return { granted: true };
    for (const p of required) {
      const result = this.check(role, p);
      if (!result.granted) return result;
    }
    return { granted: true };
  }

  grant(role: string, permission: PermissionString): void {
    if (!this.rolePermissions.has(role)) {
      this.rolePermissions.set(role, new Set());
    }
    this.rolePermissions.get(role)!.add(permission);
  }

  revoke(role: string, permission: PermissionString): void {
    this.rolePermissions.get(role)?.delete(permission);
  }

  getPermissions(role: string): PermissionString[] {
    return Array.from(this.rolePermissions.get(role) ?? []);
  }

  async requestPermission(
    moduleId: string,
    permission: PermissionString,
    reason?: string
  ): Promise<boolean> {
    eventBus.emit(SystemEvents.PERMISSION_REQUEST, { moduleId, permission, reason });
    return true;
  }
}

export const permissionManager = new PermissionManager();

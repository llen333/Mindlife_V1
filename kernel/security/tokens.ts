import crypto from 'crypto';
import { db } from '../../src/lib/db';

export interface TokenInfo {
  id: string;
  moduleId: string;
  name: string;
  permissions: string[];
  expiresAt: Date | null;
  isActive: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
}

function getHmacKey(): string {
  return process.env.TOKEN_ENCRYPTION_KEY || 'mindlife-default-key-change-in-production';
}

function hash(token: string): string {
  const key = getHmacKey();
  return crypto.createHmac('sha256', key).update(token).digest('hex');
}

export class ModuleTokenManager {
  async generate(params: {
    moduleId: string;
    name: string;
    permissions: string[];
    expiresInDays?: number;
  }): Promise<{ token: string; info: TokenInfo }> {
    const raw = `mrt_${crypto.randomBytes(32).toString('base64url')}`;
    const tokenHash = hash(raw);

    const record = await db.moduleToken.create({
      data: {
        id: `tok-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        moduleId: params.moduleId,
        name: params.name,
        tokenHash,
        permissions: JSON.stringify(params.permissions),
        expiresAt: params.expiresInDays
          ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000)
          : null,
      },
    });

    return {
      token: raw,
      info: this.toTokenInfo(record),
    };
  }

  async validate(token: string, ip?: string): Promise<TokenInfo | null> {
    const tokenHash = hash(token);
    const record = await db.moduleToken.findUnique({ where: { tokenHash } });

    if (!record) return null;
    if (!record.isActive) return null;

    if (record.expiresAt && record.expiresAt < new Date()) {
      return null;
    }

    await db.moduleToken.update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    });

    return this.toTokenInfo(record);
  }

  async revoke(tokenId: string): Promise<boolean> {
    const result = await db.moduleToken.update({
      where: { id: tokenId },
      data: { isActive: false },
    });
    return !!result;
  }

  async listForModule(moduleId: string): Promise<TokenInfo[]> {
    const records = await db.moduleToken.findMany({
      where: { moduleId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toTokenInfo(r));
  }

  async hasPermission(token: string, requiredPermission: string): Promise<boolean> {
    const info = await this.validate(token);
    if (!info) return false;
    return info.permissions.includes('*') || info.permissions.includes(requiredPermission);
  }

  private toTokenInfo(r: any): TokenInfo {
    return {
      id: r.id,
      moduleId: r.moduleId,
      name: r.name,
      permissions: JSON.parse(r.permissions),
      expiresAt: r.expiresAt,
      isActive: r.isActive,
      lastUsedAt: r.lastUsedAt,
      createdAt: r.createdAt,
    };
  }
}

export const moduleTokenManager = new ModuleTokenManager();

/**
 * Serveur de registry local pour les modules Mindlife.
 * Sert les packages .tar.gz et l'index au format RemoteStore.
 *
 * Usage: bun run packages/scripts/serve.ts [port]
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PORT = parseInt(process.argv[2] || '4800');
const PACKAGES_DIR = join(import.meta.dirname, '..');

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  intents: string[];
  dependencies: Record<string, string>;
  downloadUrl: string;
  checksum: string;
  size: number;
  updatedAt: string;
}

function readManifest(name: string): { manifest: any; checksum: string } | null {
  const dir = join(PACKAGES_DIR, name);
  const manifestPath = join(dir, 'manifest.json');
  const checksumPath = join(dir, 'checksum.txt');
  if (!existsSync(manifestPath) || !existsSync(checksumPath)) return null;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const checksum = readFileSync(checksumPath, 'utf-8').trim();
  return { manifest, checksum };
}

function buildIndex(): PackageInfo[] {
  const entries: PackageInfo[] = [];
  for (const entry of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'scripts') continue;
    const data = readManifest(entry.name);
    if (!data) continue;
    const { manifest, checksum } = data;
    const pkgPath = join(PACKAGES_DIR, entry.name, 'package.tar.gz');
    const stat = existsSync(pkgPath) ? awaitStat(pkgPath) : null;
    entries.push({
      name: manifest.id || entry.name,
      version: manifest.version || '0.0.0',
      description: manifest.description || '',
      author: manifest.author || 'Mindlife Team',
      permissions: manifest.permissions || [],
      intents: manifest.intents || [],
      dependencies: manifest.dependencies || {},
      downloadUrl: `http://localhost:${PORT}/packages/${entry.name}/package.tar.gz`,
      checksum,
      size: stat?.size || 0,
      updatedAt: stat?.mtime || new Date().toISOString(),
    });
  }
  return entries;
}

function awaitStat(p: string): { size: number; mtime: string } | null {
  try {
    const s = readFileSync(p);
    return { size: s.length, mtime: new Date().toISOString() };
  } catch { return null; }
}

Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const path = url.pathname;

    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${path}`);

    // API endpoints
    if (path === '/api/v1/packages') {
      const index = buildIndex();
      return new Response(JSON.stringify({ packages: index }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const pkgMatch = path.match(/^\/api\/v1\/package\/(.+)/);
    if (pkgMatch) {
      const name = decodeURIComponent(pkgMatch[1]);
      const index = buildIndex();
      const pkg = index.find(p => p.name === name);
      if (!pkg) return new Response('Not found', { status: 404 });
      return new Response(JSON.stringify(pkg), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const dlMatch = path.match(/^\/packages\/(.+)\/package\.tar\.gz$/);
    if (dlMatch) {
      const name = dlMatch[1];
      const filePath = join(PACKAGES_DIR, name, 'package.tar.gz');
      if (!existsSync(filePath)) return new Response('Package not found', { status: 404 });
      const data = readFileSync(filePath);
      return new Response(data, {
        headers: {
          'Content-Type': 'application/gzip',
          'Access-Control-Allow-Origin': '*',
          'Content-Length': data.length.toString(),
        },
      });
    }

    return new Response('Not found', { status: 404 });
  },
});

console.log(`\n📦 Registry local Mindlife : http://localhost:${PORT}`);
console.log(`   Index : http://localhost:${PORT}/api/v1/packages`);
console.log(`\n   Pour que le kernel l'utilise :`);
console.log(`   remoteStore.setRegistry('http://localhost:${PORT}')`);

/**
 * Build script : lit le module.json + sources d'un module, crée le .tar.gz,
 * calcule le checksum, enregistre dans le ModuleStore.
 *
 * Usage: bun run packages/scripts/build.ts nutrition
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import type { ModuleManifest } from '../../src/lib/bus/types';

const MODULES_SRC = join(import.meta.dirname, '../../src/lib/modules');
const PACKAGES_OUT = join(import.meta.dirname, '..');

const MODULE_META: Record<string, Partial<ModuleManifest>> = {
  nutrition: {
    intents: ['recipe_search', 'meal_log', 'meal_plan', 'nutrition_advice'],
    timeout: 15000,
    rateLimit: { maxRequests: 60, windowMs: 60000 },
    allowedPaths: ['/tmp'],
    allowNetwork: true,
    maxMemoryMb: 128,
  },
  sport: {
    intents: ['workout_log', 'workout_plan', 'biometrics_track', 'exercise_search'],
    timeout: 10000,
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    allowNetwork: false,
    maxMemoryMb: 64,
  },
  organisation: {
    intents: ['task_create', 'task_list', 'event_plan', 'goal_track'],
    timeout: 5000,
    rateLimit: { maxRequests: 120, windowMs: 60000 },
    allowNetwork: false,
    maxMemoryMb: 32,
  },
  recherche: {
    intents: ['web_search', 'scrape_url', 'news_fetch'],
    timeout: 20000,
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    allowedPaths: ['/tmp'],
    allowNetwork: true,
    maxMemoryMb: 256,
  },
  donnees: {
    intents: ['data_save', 'data_query', 'data_export', 'log_entry'],
    timeout: 5000,
    rateLimit: { maxRequests: 200, windowMs: 60000 },
    allowNetwork: false,
    maxMemoryMb: 64,
  },
};

async function buildModule(name: string) {
  const srcDir = join(MODULES_SRC, name);
  const moduleJsonPath = join(srcDir, 'module.json');

  if (!existsSync(srcDir)) {
    console.error(`❌ Module '${name}' introuvable dans ${srcDir}`);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(moduleJsonPath, 'utf-8'));
  const meta = MODULE_META[name] || {};

  const manifest: ModuleManifest = {
    ...raw,
    ...meta,
  };

  const files = ['index.ts', 'tools.ts', 'fallback.ts', 'module.json'].filter(f => existsSync(join(srcDir, f)));

  const tarEntries: Uint8Array[] = [];
  const encoder = new TextEncoder();

  tarEntries.push(encodeTarEntry('manifest.json', encoder.encode(JSON.stringify(manifest, null, 2))));

  for (const file of files) {
    const content = readFileSync(join(srcDir, file));
    tarEntries.push(encodeTarEntry(file, content));
  }

  tarEntries.push(new Uint8Array(1024));
  const tar = concatUint8(tarEntries);

  const { gzipSync } = await import('node:zlib');
  const gz = gzipSync(tar);

  const checksum = createHash('sha256').update(gz).digest('hex');
  const outDir = join(PACKAGES_OUT, name);
  mkdirSync(outDir, { recursive: true });

  writeFileSync(join(outDir, 'package.tar.gz'), gz);
  writeFileSync(join(outDir, 'checksum.txt'), checksum);
  writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`✅ ${name} v${manifest.version} empaqueté`);
  console.log(`   Fichier : packages/${name}/package.tar.gz (${(gz.length / 1024).toFixed(1)} KB)`);
  console.log(`   SHA-256 : ${checksum.slice(0, 16)}…`);
  console.log(`   Permissions : ${(manifest.permissions || []).join(', ')}`);
  console.log(`   Intents : ${(manifest.intents || []).join(', ')}`);
}

function encodeTarEntry(name: string, content: Uint8Array): Uint8Array {
  const BLOCK = 512;
  const nameBytes = new TextEncoder().encode(name);
  const header = new Uint8Array(BLOCK);
  const encoder = new TextEncoder();

  header.set(nameBytes.slice(0, 100), 0);

  const sizeStr = content.length.toString(8).padStart(11, '0');
  header.set(encoder.encode(sizeStr), 124);

  header[156] = 48;

  const blank = new Uint8Array(header);
  for (let i = 148; i < 156; i++) blank[i] = 32;
  let sum = 0;
  for (const b of blank) sum += b;
  const chk = sum.toString(8).padStart(7, '0') + ' ';
  header.set(encoder.encode(chk), 148);

  const dataBlocks = Math.ceil(content.length / BLOCK);
  const padded = new Uint8Array(dataBlocks * BLOCK);
  padded.set(content);

  return concatUint8([header, padded]);
}

function concatUint8(buffers: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const b of buffers) total += b.length;
  const result = new Uint8Array(total);
  let pos = 0;
  for (const b of buffers) { result.set(b, pos); pos += b.length; }
  return result;
}

const moduleName = process.argv[2];
if (!moduleName) {
  console.log('Usage: bun run packages/scripts/build.ts <module_name>\n');
  console.log('Modules disponibles: nutrition, sport, organisation, recherche, donnees');
  process.exit(1);
}

buildModule(moduleName).catch(console.error);

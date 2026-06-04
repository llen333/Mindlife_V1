import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

export interface ExtractedPackage {
  manifest: Record<string, unknown>;
  code: string;
  assets: Map<string, Uint8Array>;
}

export interface PackageEntry {
  name: string;
  content: Uint8Array;
}

export function verifyChecksum(data: Uint8Array, expected: string): boolean {
  const hash = createHash('sha256').update(data).digest('hex');
  return hash === expected.toLowerCase();
}

export function parseTarGz(data: Uint8Array): PackageEntry[] {
  const decompressed = gunzipSync(data);
  return parseTar(decompressed);
}

export function extractPackage(data: Uint8Array): ExtractedPackage {
  const entries = parseTarGz(data);
  let manifest: Record<string, unknown> = {};
  let code = '';
  const assets = new Map<string, Uint8Array>();

  for (const entry of entries) {
    const name = entry.name.replace(/^.*[/\\]/, '');

    if (name === 'manifest.json' || entry.name.endsWith('/manifest.json')) {
      manifest = JSON.parse(new TextDecoder().decode(entry.content));
    } else if (name.endsWith('.ts') || name.endsWith('.js')) {
      code = new TextDecoder().decode(entry.content);
    } else if (name !== '' && !name.endsWith('/')) {
      assets.set(entry.name, entry.content);
    }
  }

  return { manifest, code, assets };
}

export function createTarGz(entries: PackageEntry[]): Uint8Array {
  const buffer = createTar(entries);
  const { gzipSync } = require('node:zlib');
  return gzipSync(buffer);
}

function createTar(entries: PackageEntry[]): Uint8Array {
  const BLOCK = 512;
  const buffers: Uint8Array[] = [];

  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.name);
    const content = entry.content;
    const header = new Uint8Array(BLOCK);
    const encoder = new TextEncoder();

    const nameField = nameBytes.slice(0, 100);
    header.set(nameField, 0);

    const sizeStr = content.length.toString(8).padStart(11, '0');
    header.set(encoder.encode(sizeStr), 124);

    header[156] = 48;

    const checksum = computeChecksum(header);
    header.set(encoder.encode(checksum.padStart(7, '0') + ' '), 148);

    buffers.push(header);

    const dataBlocks = Math.ceil(content.length / BLOCK);
    const paddedContent = new Uint8Array(dataBlocks * BLOCK);
    paddedContent.set(content);
    buffers.push(paddedContent);
  }

  buffers.push(new Uint8Array(BLOCK * 2));
  return concatBuffers(buffers);
}

function computeChecksum(header: Uint8Array): string {
  let sum = 0;
  const blank = new Uint8Array(header);
  for (let i = 148; i < 156; i++) blank[i] = 32;
  for (const b of blank) sum += b;
  return sum.toString(8);
}

function parseTar(data: Uint8Array): PackageEntry[] {
  const BLOCK = 512;
  const entries: PackageEntry[] = [];
  let offset = 0;

  while (offset + BLOCK <= data.length) {
    const header = data.slice(offset, offset + BLOCK);
    offset += BLOCK;

    if (header[0] === 0) break;

    const nameBytes = [];
    for (let i = 0; i < 100 && header[i] !== 0; i++) {
      nameBytes.push(header[i]);
    }
    const name = new TextDecoder().decode(new Uint8Array(nameBytes));
    if (!name) break;

    const sizeStrBytes = [];
    for (let i = 124; i < 136 && header[i] !== 0 && header[i] !== 32; i++) {
      sizeStrBytes.push(header[i]);
    }
    const sizeStr = new TextDecoder().decode(new Uint8Array(sizeStrBytes));
    const size = parseInt(sizeStr, 8) || 0;

    const typeFlag = header[156];

    if (typeFlag === 48 || typeFlag === 0) {
      const contentBlocks = Math.ceil(size / BLOCK);
      const content = data.slice(offset, offset + size);
      entries.push({ name, content: new Uint8Array(content) });
      offset += contentBlocks * BLOCK;
    } else {
      const contentBlocks = Math.ceil(size / BLOCK);
      offset += contentBlocks * BLOCK;
    }
  }

  return entries;
}

function concatBuffers(buffers: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const b of buffers) total += b.length;
  const result = new Uint8Array(total);
  let pos = 0;
  for (const b of buffers) {
    result.set(b, pos);
    pos += b.length;
  }
  return result;
}

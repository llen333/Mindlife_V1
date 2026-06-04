import { describe, it, expect, afterAll } from 'vitest';
import { createTarGz, extractPackage, verifyChecksum } from '../../kernel/store/packager';
import { moduleStore } from '../../kernel/store/manager';
import { remoteStore } from '../../kernel/store/remote';

const TEST_MANIFEST = {
  id: 'test-pkg',
  name: 'Test Package',
  version: '1.0.0',
  description: 'A test package',
  author: 'Test Author',
  permissions: ['test:read', 'test:write'],
  intents: ['test_action'],
  timeout: 5000,
  rateLimit: { maxRequests: 30, windowMs: 60000 },
  allowNetwork: false,
  maxMemoryMb: 32,
};

const TEST_CODE = `export function hello() { return "hello from package"; }`;

describe('Module Packages - Build Pipeline', () => {
  it('should create and extract a tar.gz package', () => {
    const manifestJson = JSON.stringify(TEST_MANIFEST);
    const entries = [
      { name: 'manifest.json', content: new TextEncoder().encode(manifestJson) },
      { name: 'index.ts', content: new TextEncoder().encode(TEST_CODE) },
    ];

    const archive = createTarGz(entries);
    expect(archive.length).toBeGreaterThan(0);

    const extracted = extractPackage(archive);
    expect(extracted.manifest.id).toBe('test-pkg');
    expect(extracted.manifest.version).toBe('1.0.0');
    expect(extracted.code).toContain('hello from package');
  });

  it('should verify checksum correctly', () => {
    const data = new TextEncoder().encode('test-data');
    const { createHash } = require('node:crypto');
    const hash = createHash('sha256').update(data).digest('hex');

    expect(verifyChecksum(data, hash)).toBe(true);
    expect(verifyChecksum(data, '0000000000000000000000000000000000000000000000000000000000000000')).toBe(false);
  });

  it('should extract manifest from the package', () => {
    const manifestJson = JSON.stringify(TEST_MANIFEST);
    const entries = [
      { name: 'manifest.json', content: new TextEncoder().encode(manifestJson) },
    ];

    const archive = createTarGz(entries);
    const extracted = extractPackage(archive);

    expect(extracted.manifest.permissions).toEqual(['test:read', 'test:write']);
    expect(extracted.manifest.intents).toEqual(['test_action']);
    expect(extracted.manifest.timeout).toBe(5000);
  });
});

describe('Module Packages - Store Registration', () => {
  it('should register a package from manifest', async () => {
    const id = await moduleStore.register(TEST_MANIFEST, 'test://source', 'abc123');
    expect(id).toBeTruthy();
    expect(id).toContain('test-pkg');

    const pkg = await moduleStore.get('test-pkg');
    expect(pkg).not.toBeNull();
    expect(pkg!.manifest.id).toBe('test-pkg');
    expect(pkg!.manifest.permissions).toEqual(['test:read', 'test:write']);
  });

  it('should mark package as installed/uninstalled', async () => {
    await moduleStore.markInstalled('test-pkg');
    let pkg = await moduleStore.get('test-pkg');
    expect(pkg!.isInstalled).toBe(true);

    await moduleStore.markUninstalled('test-pkg');
    pkg = await moduleStore.get('test-pkg');
    expect(pkg!.isInstalled).toBe(false);
  });

  it('should list and search packages', async () => {
    const all = await moduleStore.list();
    expect(all.some(p => p.name === 'test-pkg')).toBe(true);

    const results = await moduleStore.search('Test');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should remove package', async () => {
    await moduleStore.remove('test-pkg');
    const pkg = await moduleStore.get('test-pkg');
    expect(pkg).toBeNull();
  });
});

describe('Module Packages - Remote Store Integration', () => {
  const originalRegistry = remoteStore.getRegistry();

  afterAll(() => {
    remoteStore.setRegistry(originalRegistry);
  });

  it('should use local registry URL', () => {
    remoteStore.setRegistry('http://localhost:4800');
    expect(remoteStore.getRegistry()).toBe('http://localhost:4800');
  });

  it('should fail gracefully on unreachable registry', async () => {
    remoteStore.setRegistry('http://localhost:1');
    await expect(remoteStore.search('nutrition')).rejects.toThrow();
  });
});

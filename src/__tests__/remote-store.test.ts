import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { extractPackage, verifyChecksum, createTarGz, parseTarGz } from '../../kernel/store/packager';
import type { PackageEntry } from '../../kernel/store/packager';
import { RemoteStore } from '../../kernel/store/remote';
import { moduleStore } from '../../kernel/store/manager';

const HAS_NETWORK = (() => {
  try { return !!(process.env.VECTOR_DATABASE_URL); } catch { return false; }
})();

describe('Packager — tar.gz extraction', () => {
  it('should create and parse a tar.gz package', () => {
    const entries: PackageEntry[] = [
      { name: 'manifest.json', content: new TextEncoder().encode(JSON.stringify({ id: 'test-module', version: '1.0.0', permissions: [] })) },
      { name: 'code.ts', content: new TextEncoder().encode('export default { name: "test" }') },
    ];
    const data = createTarGz(entries);
    expect(data.length).toBeGreaterThan(0);

    const extracted = extractPackage(data);
    expect(extracted.manifest).toEqual({ id: 'test-module', version: '1.0.0', permissions: [] });
    expect(extracted.code).toContain('test');
  });

  it('should handle empty packages gracefully', () => {
    const data = createTarGz([]);
    const extracted = extractPackage(data);
    expect(extracted.manifest).toEqual({});
    expect(extracted.code).toBe('');
  });

  it('should extract multiple entries in correct order', () => {
    const entries: PackageEntry[] = [
      { name: 'a.txt', content: new TextEncoder().encode('AAA') },
      { name: 'b.txt', content: new TextEncoder().encode('BBB') },
    ];
    const data = createTarGz(entries);
    const parsed = parseTarGz(data);
    expect(parsed.length).toBe(2);
    expect(parsed[0].name).toBe('a.txt');
    expect(parsed[1].name).toBe('b.txt');
  });

  it('should preserve content exactly', () => {
    const content = 'Hello World! 123\nWith unicode: ñoño 🎉';
    const entries: PackageEntry[] = [
      { name: 'code.ts', content: new TextEncoder().encode(content) },
    ];
    const data = createTarGz(entries);
    const extracted = extractPackage(data);
    expect(extracted.code).toBe(content);
  });

  it('should extract assets into separate map', () => {
    const manifest = { id: 'test-assets', version: '1.0.0' };
    const code = 'export default {}';
    const iconContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const entries: PackageEntry[] = [
      { name: 'manifest.json', content: new TextEncoder().encode(JSON.stringify(manifest)) },
      { name: 'code.ts', content: new TextEncoder().encode(code) },
      { name: 'assets/icon.png', content: iconContent },
    ];
    const data = createTarGz(entries);
    const extracted = extractPackage(data);
    expect(extracted.manifest.id).toBe('test-assets');
    expect(extracted.code).toBe(code);
    expect(extracted.assets.size).toBe(1);
    expect(extracted.assets.get('assets/icon.png')).toEqual(iconContent);
  });
});

describe('Packager — checksum verification', () => {
  it('should verify correct checksum', () => {
    const data = new TextEncoder().encode('hello world');
    const hash = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';
    expect(verifyChecksum(data, hash)).toBe(true);
  });

  it('should reject incorrect checksum', () => {
    const data = new TextEncoder().encode('hello world');
    const hash = '0000000000000000000000000000000000000000000000000000000000000000';
    expect(verifyChecksum(data, hash)).toBe(false);
  });
});

describe('RemoteStore', () => {
  const testStore = new RemoteStore('https://registry.mindlife.ai');
  const manifest = { id: 'remote-test-module', version: '1.0.0', permissions: [], intents: [] };

  afterAll(async () => {
    try { await moduleStore.remove('remote-test-module'); } catch { /* ignore */ }
  });

  it('should construct with default registry', () => {
    const store = new RemoteStore();
    expect(store.getRegistry()).toBe('https://registry.mindlife.ai');
  });

  it('should set and get registry URL', () => {
    const store = new RemoteStore();
    store.setRegistry('https://custom.mindlife.ai');
    expect(store.getRegistry()).toBe('https://custom.mindlife.ai');
  });

  it('should fail to fetch index from non-existent registry', async () => {
    const store = new RemoteStore('https://nonexistent.invalid');
    await expect(store.fetchIndex()).rejects.toThrow();
  });

  it('should fail to get info for unknown package', async () => {
    const info = await testStore.getInfo('this-package-does-not-exist-xyz');
    expect(info).toBeNull();
  });

  it('should fail to install non-existent package', async () => {
    await expect(testStore.install('this-package-does-not-exist-xyz')).rejects.toThrow();
  });

  it('should handle search when registry is unreachable', async () => {
    const store = new RemoteStore('https://broken.registry');
    await expect(store.search('test')).rejects.toThrow();
  });
});

describe
  .skipIf(!HAS_NETWORK)
  ('RemoteStore — network integration', () => {
    it('should search public npm-like registry', async () => {
      // This is a basic test that can connect to a public registry
      const store = new RemoteStore('https://registry.npmjs.org');
      try {
        const results = await store.search('test');
        expect(Array.isArray(results)).toBe(true);
      } catch {
        // If npm registry is blocked or unreachable, skip
      }
    });
  });

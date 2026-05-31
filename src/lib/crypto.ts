export async function encryptKey(key: string, passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(passphrase.padEnd(32, 'x').slice(0, 32)),
    { name: 'AES-GCM' }, false, ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial, encoder.encode(key)
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptKey(encoded: string, passphrase: string): Promise<string> {
  try {
    const raw = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const data = raw.slice(12);
    const keyMaterial = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(passphrase.padEnd(32, 'x').slice(0, 32)),
      { name: 'AES-GCM' }, false, ['decrypt']
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, keyMaterial, data
    );
    return new TextDecoder().decode(decrypted);
  } catch { return ''; }
}

const PASSPHRASE_STORAGE_KEY = 'mindlife-crypto-passphrase';

export function getOrCreatePassphrase(): string {
  if (typeof window === 'undefined') return '';
  let pass = localStorage.getItem(PASSPHRASE_STORAGE_KEY);
  if (!pass) {
    pass = crypto.randomUUID() + crypto.randomUUID();
    localStorage.setItem(PASSPHRASE_STORAGE_KEY, pass);
  }
  return pass;
}

export const PROVIDER_KEYS_STORAGE = 'mindlife-provider-keys';

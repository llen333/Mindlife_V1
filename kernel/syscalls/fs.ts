import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, resolve, normalize } from 'path';

const ALLOWED_ROOTS = [
  resolve(process.cwd(), 'data'),
  resolve(process.cwd(), 'src/lib/modules'),
  resolve(process.cwd(), 'kernel'),
];

const ALLOWED_EXTENSIONS = ['.md', '.txt', '.json', '.csv', '.log', '.yaml', '.yml', '.env', '.ts', '.js'];

function isPathAllowed(target: string): { allowed: boolean; resolvedPath: string; reason?: string } {
  const resolved = resolve(normalize(target));
  const allowed = ALLOWED_ROOTS.some((root) => resolved.startsWith(root));
  if (!allowed) return { allowed: false, resolvedPath: resolved, reason: 'Path outside allowed roots' };
  const ext = resolved.substring(resolved.lastIndexOf('.'));
  if (ext.includes('.') && !ALLOWED_EXTENSIONS.includes(ext)) {
    return { allowed: false, resolvedPath: resolved, reason: `File extension not allowed: ${ext}` };
  }
  return { allowed: true, resolvedPath: resolved };
}

export const sysFs = {
  async read(path: string): Promise<string> {
    const { allowed, resolvedPath, reason } = isPathAllowed(path);
    if (!allowed) throw new Error(`sys.fs.read denied: ${reason}`);
    return readFileSync(resolvedPath, 'utf-8');
  },

  async write(path: string, content: string): Promise<void> {
    const { allowed, resolvedPath, reason } = isPathAllowed(path);
    if (!allowed) throw new Error(`sys.fs.write denied: ${reason}`);
    const dir = resolvedPath.substring(0, resolvedPath.lastIndexOf('/'));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(resolvedPath, content, 'utf-8');
  },

  async list(dir: string): Promise<string[]> {
    const { allowed, resolvedPath, reason } = isPathAllowed(dir);
    if (!allowed) throw new Error(`sys.fs.list denied: ${reason}`);
    if (!existsSync(resolvedPath)) return [];
    return readdirSync(resolvedPath);
  },

  async exists(path: string): Promise<boolean> {
    const { allowed, resolvedPath, reason } = isPathAllowed(path);
    if (!allowed) return false;
    return existsSync(resolvedPath);
  },

  async info(path: string): Promise<{ exists: boolean; size: number; isDirectory: boolean }> {
    const { allowed, resolvedPath } = isPathAllowed(path);
    if (!allowed || !existsSync(resolvedPath)) {
      return { exists: false, size: 0, isDirectory: false };
    }
    const st = statSync(resolvedPath);
    return { exists: true, size: st.size, isDirectory: st.isDirectory() };
  },
};

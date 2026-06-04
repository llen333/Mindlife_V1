/**
 * Build tous les modules V11a en packages .tar.gz
 *
 * Usage: bun run packages/scripts/build-all.ts
 */

const modules = ['nutrition', 'sport', 'organisation', 'recherche', 'donnees'];

for (const name of modules) {
  const mod = await import('./build.ts');
  // build.ts exports buildModule but it's not async-importable easily.
  // Instead, we'll spawn a subprocess for each.
}

// Simple sequential exec
for (const name of modules) {
  const proc = Bun.spawnSync(['bun', 'run', 'packages/scripts/build.ts', name], {
    cwd: import.meta.dirname + '/../..',
  });
  console.log(proc.stdout.toString());
  if (proc.exitCode !== 0) {
    console.error(proc.stderr.toString());
    process.exit(1);
  }
}

console.log('\n🎉 Tous les modules empaquetés dans packages/');

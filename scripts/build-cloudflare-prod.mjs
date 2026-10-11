import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const localPath = path.join(root, '.env.local');
const backupPath = path.join(root, '.env.local.build-bak');

let restored = false;
if (existsSync(localPath)) {
  renameSync(localPath, backupPath);
  restored = true;
  console.log('Temporarily moved .env.local aside so production build only uses .env.production');
}

// Next.js 15 no longer generates images-manifest.json, but OpenNext still expects it.
// Create a stub so the build doesn't fail.
const nextDir = path.join(root, '.next');
const imagesManifestPath = path.join(nextDir, 'images-manifest.json');
if (!existsSync(imagesManifestPath)) {
  mkdirSync(nextDir, { recursive: true });
  writeFileSync(imagesManifestPath, JSON.stringify({ version: 1, images: [] }, null, 2));
  console.log('Created stub images-manifest.json for OpenNext compatibility');
}

const patchSymlink = spawnSync('node', ['scripts/patch-opennext-symlink.mjs'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});
if (patchSymlink.status !== 0) {
  process.exit(patchSymlink.status ?? 1);
}

const openNextDir = path.join(root, '.open-next');
if (existsSync(openNextDir)) {
  // Windows long paths under .pnpm often break PowerShell Remove-Item
  const rm = spawnSync('cmd', ['/c', 'rd', '/s', '/q', openNextDir], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });
  if (rm.status !== 0 && existsSync(openNextDir)) {
    rmSync(openNextDir, { recursive: true, force: true, maxRetries: 3 });
  }
}

const result = spawnSync('pnpm', ['exec', 'opennextjs-cloudflare', 'build'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    OPENNEXT_BUILD: '1',
  },
});

if (restored) {
  renameSync(backupPath, localPath);
  console.log('Restored .env.local');
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const workerPatch = spawnSync('node', ['scripts/patch-opennext-worker.mjs'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

process.exit(workerPatch.status ?? 1);

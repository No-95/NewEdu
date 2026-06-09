import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const workerDir = path.join(root, 'GeminiWorker');
const envPath = path.join(root, '.env.local');

const text = readFileSync(envPath, 'utf8');
const env = new Map();

for (const line of text.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx < 1) continue;
  env.set(trimmed.slice(0, idx).trim(), trimmed.slice(idx + 1).trim());
}

const mappings = [
  ['GEMINI_API_KEY', 'GEMINI_API_KEY'],
  ['GEMINI_MODEL', 'GEMINI_MODEL'],
  ['AI_WORKER_INTERNAL_TOKEN', 'INTERNAL_SHARED_TOKEN'],
];

for (const [from, to] of mappings) {
  const value = env.get(from);
  if (!value) {
    console.warn(`Skip ${to}: ${from} not in .env.local`);
    continue;
  }

  console.log(`Setting gemini-worker secret: ${to}`);
  const wranglerConfig = path.join(workerDir, 'wrangler.toml');
  const result = spawnSync(
    'pnpm',
    ['exec', 'wrangler', '-c', wranglerConfig, 'secret', 'put', to],
    {
      cwd: root,
      input: value,
      encoding: 'utf8',
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, CI: 'true' },
    }
  );

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(1);
  }
}

console.log('Gemini worker secrets synced.');

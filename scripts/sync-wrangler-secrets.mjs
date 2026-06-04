import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env.local');

const extra = process.argv.slice(2).join('\n');
let text = readFileSync(envPath, 'utf8');
if (extra) {
  text += `\n${extra}\n`;
}

const keys = new Set();
for (const line of text.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx < 1) continue;
  const name = trimmed.slice(0, idx).trim();
  const value = trimmed.slice(idx + 1).trim();
  if (!name || keys.has(name)) continue;
  // Public build-time vars live in .env.production / wrangler.jsonc vars
  if (name.startsWith('NEXT_PUBLIC_')) continue;
  keys.add(name);

  console.log(`Setting secret: ${name}`);
  const result = spawnSync('pnpm', ['exec', 'wrangler', 'secret', 'put', name], {
    cwd: root,
    input: value,
    encoding: 'utf8',
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(1);
  }
}

console.log('All secrets set.');

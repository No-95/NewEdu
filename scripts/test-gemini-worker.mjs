import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(path.join(root, '.env.local'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = (env.AI_WORKER_URL || '').trim() || 'https://gemini-worker.minhhoangd852.workers.dev/ai/chat';
const token = env.AI_WORKER_INTERNAL_TOKEN;

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-token': token,
  },
  body: JSON.stringify({ message: 'Say hi in one short sentence.' }),
});

const body = await res.json();
console.log('status', res.status);
console.log('model', body.model);
console.log('reply', body.reply?.slice(0, 120));
if (body.error) console.log('error', body.error, body.detail?.slice(0, 200));

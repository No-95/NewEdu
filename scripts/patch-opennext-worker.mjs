import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const handlerPath = path.join(root, '.open-next', 'server-functions', 'default', 'handler.mjs');

let content = readFileSync(handlerPath, 'utf8');

const emptyManifest = '{version:3,middleware:{},sortedMiddleware:[],functions:{}}';

const oldGetManifest =
  'getMiddlewareManifest(){return this.minimalMode?null:require(this.middlewareManifestPath)}';

const newGetManifest = `getMiddlewareManifest(){return this.minimalMode?null:${emptyManifest}}`;

if (content.includes(newGetManifest)) {
  console.log('Handler getMiddlewareManifest already patched');
  process.exit(0);
}

if (!content.includes(oldGetManifest)) {
  console.error('Handler patch pattern not found in handler.mjs');
  process.exit(1);
}

content = content.replaceAll(oldGetManifest, newGetManifest);
writeFileSync(handlerPath, content);
console.log('Patched handler.mjs getMiddlewareManifest (no dynamic require)');

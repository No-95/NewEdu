import { spawnSync } from 'node:child_process';

const isCloudflarePages = process.env.CF_PAGES === '1';
const isCi = process.env.CI === 'true';
const forceOpenNext = process.env.OPENNEXT_BUILD === '1';
const shouldBuildOpenNext = isCloudflarePages || isCi || forceOpenNext;

const command = shouldBuildOpenNext
  ? 'pnpm exec opennextjs-cloudflare build'
  : 'pnpm exec next build';

const result = spawnSync(command, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);

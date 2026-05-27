import { spawnSync } from 'node:child_process';

const isCloudflarePages = process.env.CF_PAGES === '1';
const isCi = process.env.CI === 'true';
const isOpenNextBuild = process.env.OPENNEXT_BUILD === '1';
const forceOpenNext = process.env.FORCE_OPENNEXT === '1';
// Prevent infinite recursion: if already inside OpenNext, just run next build
const shouldBuildOpenNext = !isOpenNextBuild && (isCloudflarePages || isCi || forceOpenNext);

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

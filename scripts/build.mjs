import { spawnSync } from 'node:child_process';

const isCloudflarePages = process.env.CF_PAGES === '1';
const isCi = process.env.CI === 'true';
// Treat any defined OPENNEXT_BUILD value as truthy to be robust
const isOpenNextBuild = typeof process.env.OPENNEXT_BUILD !== 'undefined' && process.env.OPENNEXT_BUILD !== '';
const forceOpenNext = process.env.FORCE_OPENNEXT === '1';
// Prevent infinite recursion: if already inside OpenNext, just run next build
const shouldBuildOpenNext = !isOpenNextBuild && (isCloudflarePages || isCi || forceOpenNext);

const command = shouldBuildOpenNext
  ? 'pnpm exec opennextjs-cloudflare build'
  : 'pnpm exec next build';

// When spawning the OpenNext build, mark the environment so that any nested
// invocations of this script can detect OpenNext and avoid recursion.
const childEnv = shouldBuildOpenNext
  ? { ...process.env, OPENNEXT_BUILD: '1' }
  : { ...process.env };

const result = spawnSync(command, {
  stdio: 'inherit',
  shell: true,
  env: childEnv,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);

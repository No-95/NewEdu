import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const messagesDir = path.join(root, 'convex-messages');
const deployEnvPath = path.join(messagesDir, '.env.deploy.local');

function readDeployKey() {
  if (process.env.CONVEX_MESSAGES_DEPLOY_KEY?.trim()) {
    return process.env.CONVEX_MESSAGES_DEPLOY_KEY.trim();
  }
  if (process.env.CONVEX_DEPLOY_KEY?.trim()) {
    return process.env.CONVEX_DEPLOY_KEY.trim();
  }
  if (fs.existsSync(deployEnvPath)) {
    const content = fs.readFileSync(deployEnvPath, 'utf8');
    const match = content.match(/^CONVEX_DEPLOY_KEY=(.+)$/m);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return null;
}

const deployKey = readDeployKey();
if (!deployKey) {
  console.error(
    [
      'Missing CONVEX_MESSAGES_DEPLOY_KEY.',
      '',
      '1. Open Convex dashboard for fantastic-kookabura-624',
      '2. Settings → Deploy Keys → Generate Production Deploy Key',
      '3. Save to convex-messages/.env.deploy.local:',
      '   CONVEX_DEPLOY_KEY=prod:...',
      '',
      'Or run:',
      '   $env:CONVEX_MESSAGES_DEPLOY_KEY="prod:..."; pnpm run deploy:messages:fantastic',
    ].join('\n')
  );
  process.exit(1);
}

console.log('Deploying messaging backend to fantastic-kookabura-624...');

execSync('npx convex deploy --yes', {
  cwd: messagesDir,
  env: {
    ...process.env,
    CONVEX_DEPLOY_KEY: deployKey,
  },
  stdio: 'inherit',
});

console.log('Done. Update NEXT_PUBLIC_CONVEX_MESSAGES_URL if needed, then pnpm run deploy:prod');

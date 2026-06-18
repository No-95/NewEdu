import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export function resolveServerEnv(name: string): string {
  const fromEnv = (process.env[name] || '').trim();
  if (fromEnv) return fromEnv;

  const candidateDirs: string[] = [];
  let currentDir = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    candidateDirs.push(currentDir);
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  const candidates = candidateDirs.flatMap((dir) => [
    path.join(dir, '.env.local'),
    path.join(dir, '.env'),
    path.join(dir, 'New-HDP-Edu', '.env.local'),
    path.join(dir, 'New-HDP-Edu', '.env'),
  ]);

  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;
    try {
      const fileText = readFileSync(filePath, 'utf8');
      const line = fileText.split(/\r?\n/).find((item) => item.trim().startsWith(`${name}=`));
      if (!line) continue;
      const value = line.slice(line.indexOf('=') + 1).trim().replace(/^['"]|['"]$/g, '');
      if (value) return value;
    } catch {
      continue;
    }
  }
  return '';
}

export function normalizeWorkerChatUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname === '/' || parsed.pathname === '') parsed.pathname = '/ai/chat';
    return parsed.toString();
  } catch {
    if (trimmed.endsWith('/ai/chat')) return trimmed;
    return `${trimmed.replace(/\/+$/, '')}/ai/chat`;
  }
}

export async function callGeminiWorker(
  message: string,
  locale?: 'en' | 'vi' | 'ko'
): Promise<{ reply: string; model?: string }> {
  const workerUrl = normalizeWorkerChatUrl(resolveServerEnv('AI_WORKER_URL'));
  const workerToken = resolveServerEnv('AI_WORKER_INTERNAL_TOKEN');

  if (!workerUrl || !workerToken) {
    throw new Error('AI_UNAVAILABLE');
  }

  let workerResponse: Response;
  try {
    workerResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-token': workerToken,
      },
      body: JSON.stringify({
        message: message.slice(0, 12000),
        locale,
        history: [],
      }),
    });
  } catch {
    throw new Error('AI_UNAVAILABLE');
  }

  const rawBody = await workerResponse.text();
  let data: { reply?: string; model?: string; error?: string; detail?: string } = {};
  try {
    data = JSON.parse(rawBody) as typeof data;
  } catch {
    throw new Error(`Worker returned non-JSON: ${rawBody.slice(0, 200)}`);
  }

  if (workerResponse.status === 401) {
    throw new Error('AI_UNAUTHORIZED');
  }
  if (workerResponse.status === 503 || workerResponse.status >= 500) {
    throw new Error('AI_UNAVAILABLE');
  }

  if (!workerResponse.ok || !data.reply) {
    throw new Error(data.error || data.detail || 'Worker AI request failed.');
  }

  return { reply: data.reply, model: data.model };
}

export function extractJsonFromReply(reply: string): string {
  const fenced = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();
  const start = reply.indexOf('{');
  const end = reply.lastIndexOf('}');
  if (start >= 0 && end > start) return reply.slice(start, end + 1);
  const arrStart = reply.indexOf('[');
  const arrEnd = reply.lastIndexOf(']');
  if (arrStart >= 0 && arrEnd > arrStart) return reply.slice(arrStart, arrEnd + 1);
  return reply.trim();
}

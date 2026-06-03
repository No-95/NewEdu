import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { api } from '@/convex/_generated/api';

type IncomingHistoryItem = {
  role: 'user' | 'assistant';
  text: string;
};

type IncomingPayload = {
  message?: string;
  history?: IncomingHistoryItem[];
};

const MAX_MESSAGE_CHARS = 1500;
const MAX_HISTORY_ITEMS = 8;
const DAILY_REQUEST_LIMIT = 10;

function normalizeWorkerChatUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname === '/' || parsed.pathname === '') {
      parsed.pathname = '/ai/chat';
    }
    return parsed.toString();
  } catch {
    if (trimmed.endsWith('/ai/chat')) {
      return trimmed;
    }
    return `${trimmed.replace(/\/+$/, '')}/ai/chat`;
  }
}

function resolveServerEnv(name: string): string {
  const fromEnv = (process.env[name] || '').trim();
  if (fromEnv) {
    return fromEnv;
  }

  const candidateDirs: string[] = [];
  let currentDir = process.cwd();

  for (let i = 0; i < 8; i += 1) {
    candidateDirs.push(currentDir);
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  const candidates = candidateDirs.flatMap((dir) => [
    path.join(dir, '.env.local'),
    path.join(dir, '.env'),
    path.join(dir, 'New-HDP-Edu', '.env.local'),
    path.join(dir, 'New-HDP-Edu', '.env'),
  ]);

  for (const filePath of candidates) {
    if (!existsSync(filePath)) {
      continue;
    }

    try {
      const fileText = readFileSync(filePath, 'utf8');
      const line = fileText
        .split(/\r?\n/)
        .find((item) => item.trim().startsWith(`${name}=`));

      if (!line) {
        continue;
      }

      const value = line.slice(line.indexOf('=') + 1).trim().replace(/^['"]|['"]$/g, '');
      if (value) {
        return value;
      }
    } catch {
      continue;
    }
  }

  return '';
}

function getDateKeyUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildUsageIdentifier(email: string | undefined, forwardedFor: string | null): string {
  if (email) {
    return `user:${email.trim().toLowerCase()}`;
  }

  const ip = (forwardedFor || '').split(',')[0]?.trim();
  if (ip) {
    return `ip:${ip}`;
  }

  return 'anon:unknown';
}

export async function POST(request: Request) {
  const workerUrl = normalizeWorkerChatUrl(resolveServerEnv('AI_WORKER_URL'));
  const workerToken = resolveServerEnv('AI_WORKER_INTERNAL_TOKEN');
  const convexUrl = resolveServerEnv('NEXT_PUBLIC_CONVEX_URL');

  if (!workerUrl) {
    return NextResponse.json(
      { error: 'Missing AI_WORKER_URL on server.' },
      { status: 500 }
    );
  }

  if (!workerToken) {
    return NextResponse.json(
      { error: 'Missing AI_WORKER_INTERNAL_TOKEN on server.' },
      { status: 500 }
    );
  }

  if (!convexUrl) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_CONVEX_URL on server.' },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const headerStore = await headers();
  const identifier = buildUsageIdentifier(
    cookieStore.get('user_email')?.value,
    headerStore.get('x-forwarded-for')
  );
  const dateKey = getDateKeyUtc();

  const convex = new ConvexHttpClient(convexUrl);
  const usage = await convex.mutation(api.supportRateLimit.consumeDailySupportRequest, {
    identifier,
    dateKey,
    limit: DAILY_REQUEST_LIMIT,
  });

  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: 'Daily request limit reached.',
        detail: `You have reached ${DAILY_REQUEST_LIMIT} AI chat requests for today.`,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(usage.limit),
          'X-RateLimit-Remaining': String(usage.remaining),
          'X-RateLimit-Used': String(usage.used),
        },
      }
    );
  }

  let payload: IncomingPayload;
  try {
    payload = (await request.json()) as IncomingPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const userMessage = (payload.message || '').trim();
  if (!userMessage) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  const safeMessage = userMessage.slice(0, MAX_MESSAGE_CHARS);
  const safeHistory = Array.isArray(payload.history)
    ? payload.history.slice(-MAX_HISTORY_ITEMS)
    : [];

  const forwardedPayload: IncomingPayload = {
    message: safeMessage,
    history: safeHistory
      .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.text === 'string')
      .map((item) => ({
        role: item.role,
        text: item.text.slice(0, MAX_MESSAGE_CHARS),
      })),
  };

  try {
    const workerResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-token': workerToken,
      },
      body: JSON.stringify(forwardedPayload),
    });

    const rawBody = await workerResponse.text();
    let data: {
      reply?: string;
      model?: string;
      error?: string;
      detail?: string;
    } = {};

    try {
      data = JSON.parse(rawBody) as {
        reply?: string;
        model?: string;
        error?: string;
        detail?: string;
      };
    } catch {
      data = {
        error: 'Worker returned non-JSON response.',
        detail: rawBody.slice(0, 300),
      };
    }

    if (!workerResponse.ok || !data?.reply) {
      return NextResponse.json(
        {
          error: data?.error || 'Worker AI request failed.',
          detail: data?.detail || 'No reply from Worker AI endpoint.',
        },
        {
          status: workerResponse.ok ? 502 : workerResponse.status,
          headers: {
            'X-RateLimit-Limit': String(usage.limit),
            'X-RateLimit-Remaining': String(usage.remaining),
            'X-RateLimit-Used': String(usage.used),
          },
        }
      );
    }

    return NextResponse.json(
      { reply: data.reply, model: data.model || 'worker' },
      {
        headers: {
          'X-RateLimit-Limit': String(usage.limit),
          'X-RateLimit-Remaining': String(usage.remaining),
          'X-RateLimit-Used': String(usage.used),
        },
      }
    );
  } catch (error) {
    console.error('Error in /api/support/chat worker proxy:', error);
    return NextResponse.json(
      { error: 'Unable to reach AI Worker endpoint.' },
      { status: 500 }
    );
  }
}

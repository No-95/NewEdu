interface Env {
  GEMINI_API_KEY: string;
  INTERNAL_SHARED_TOKEN: string;
  GEMINI_MODEL?: string;
}

type IncomingHistoryItem = {
  role: 'user' | 'assistant';
  text: string;
};

type IncomingPayload = {
  message?: string;
  history?: IncomingHistoryItem[];
};

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const FALLBACK_MODELS = ['gemini-1.5-flash'];
const MAX_MESSAGE_CHARS = 1500;
const MAX_HISTORY_ITEMS = 8;

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

function trimDetail(input: string): string {
  return input.replace(/\s+/g, ' ').trim().slice(0, 300);
}

function buildContents(payload: IncomingPayload) {
  const userMessage = (payload.message || '').trim();
  const safeMessage = userMessage.slice(0, MAX_MESSAGE_CHARS);
  const safeHistory = Array.isArray(payload.history)
    ? payload.history.slice(-MAX_HISTORY_ITEMS)
    : [];

  return [
    ...safeHistory
      .filter(
        (item) =>
          item &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.text === 'string',
      )
      .map((item) => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.text.slice(0, MAX_MESSAGE_CHARS) }],
      })),
    {
      role: 'user',
      parts: [{ text: safeMessage }],
    },
  ];
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return json(
        {
          ok: true,
          service: 'gemini-worker',
          endpoints: {
            health: 'GET /health',
            chat: 'POST /ai/chat',
          },
        },
        { status: 200 },
      );
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, service: 'gemini-worker' }, { status: 200 });
    }

    if (url.pathname === '/ai/chat' && request.method !== 'POST') {
      return json(
        {
          error: 'Method not allowed.',
          detail: 'Use POST /ai/chat with JSON body and x-internal-token header.',
        },
        {
          status: 405,
          headers: {
            Allow: 'POST',
          },
        },
      );
    }

    if (request.method !== 'POST' || url.pathname !== '/ai/chat') {
      return json(
        {
          error: 'Not found',
          detail: 'Available endpoints: GET /, GET /health, POST /ai/chat',
        },
        { status: 404 },
      );
    }

    const authHeader = request.headers.get('x-internal-token') || '';
    if (!env.INTERNAL_SHARED_TOKEN || authHeader !== env.INTERNAL_SHARED_TOKEN) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: 'Missing GEMINI_API_KEY secret in Worker.' }, { status: 500 });
    }

    let payload: IncomingPayload;
    try {
      payload = (await request.json()) as IncomingPayload;
    } catch {
      return json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const userMessage = (payload.message || '').trim();
    if (!userMessage) {
      return json({ error: 'Message is required.' }, { status: 400 });
    }

    const contents = buildContents(payload);
    const preferredModel = (env.GEMINI_MODEL || DEFAULT_MODEL).trim();
    const modelsToTry = [
      preferredModel,
      ...FALLBACK_MODELS.filter((item) => item !== preferredModel),
    ];

    let lastFailure: { model: string; status: number; message: string } | null = null;

    for (const model of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

      const geminiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: 'You are HDP EDU customer support AI. Be concise, helpful, and polite. If unsure, suggest contacting human support.',
              },
            ],
          },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 180,
          },
        }),
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        lastFailure = {
          model,
          status: geminiResponse.status,
          message: trimDetail(errorText),
        };

        if (geminiResponse.status === 400 || geminiResponse.status === 404) {
          continue;
        }

        break;
      }

      const data = await geminiResponse.json<{
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      }>();

      const parts = data?.candidates?.[0]?.content?.parts;
      const reply = Array.isArray(parts)
        ? parts
            .map((part) => part.text || '')
            .join('')
            .trim()
        : '';

      if (!reply) {
        lastFailure = {
          model,
          status: 502,
          message: 'Gemini returned no content',
        };
        continue;
      }

      return json({ reply, model }, { status: 200 });
    }

    return json(
      {
        error: 'Gemini API request failed.',
        detail: lastFailure
          ? `model=${lastFailure.model}; status=${lastFailure.status}; message=${lastFailure.message}`
          : 'No successful Gemini response from configured models.',
      },
      { status: 502 },
    );
  },
};

interface Env {
  GEMINI_API_KEY: string;
  INTERNAL_SHARED_TOKEN: string;
  GEMINI_MODEL?: string;
  CF_AI_GATEWAY_ACCOUNT_ID?: string;
  CF_AI_GATEWAY_ID?: string;
  CF_AIG_TOKEN?: string;
}

type IncomingHistoryItem = {
  role: 'user' | 'assistant';
  text: string;
};

type ChatLocale = 'en' | 'vi' | 'ko';

type IncomingPayload = {
  message?: string;
  history?: IncomingHistoryItem[];
  locale?: ChatLocale;
};

// Gemini 1.5 models are shut down (404 on v1beta). Use 2.5+ only.
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const FALLBACK_MODELS = ['gemini-2.5-flash'];
const MAX_MESSAGE_CHARS = 1500;
const MAX_HISTORY_ITEMS = 8;

const SYSTEM_INSTRUCTION = `You are HDP EDU customer support AI for a Korean-language education platform (courses, enrollment, payments, video lessons).

Languages: You are fluent in English, Vietnamese (Tiếng Việt), and Korean (한국어).
- Always reply in the same language as the user's latest message.
- If the user mixes languages, reply in the language they used most in that message.
- If the message is only greetings or unclear, use the optional "locale" field (en, vi, ko) when provided; otherwise default to Vietnamese.

Style: Be concise, helpful, and polite. Use simple wording. Keep answers short unless the user asks for detail.
Topics: courses on hdpedu.com, signing in, PayOS purchases, video access, teachers, and general platform help.
If unsure or the request needs a human, say so and suggest contacting support via the Contact page.`;

const LOCATION_ERROR =
  'Gemini blocked this request region. Redeploy gemini-worker with placement enabled, or route via Cloudflare AI Gateway.';

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

function isLocationBlocked(status: number, message: string): boolean {
  return (
    status === 400 &&
    (message.includes('location is not supported') ||
      message.includes('FAILED_PRECONDITION'))
  );
}

function buildGeminiRequest(env: Env, model: string): { url: string; headers: Record<string, string> } {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-goog-api-key': env.GEMINI_API_KEY,
  };

  const accountId = (env.CF_AI_GATEWAY_ACCOUNT_ID || '').trim();
  const gatewayId = (env.CF_AI_GATEWAY_ID || '').trim();
  if (accountId && gatewayId) {
    const token = (env.CF_AIG_TOKEN || '').trim();
    if (token) {
      headers['cf-aig-authorization'] = `Bearer ${token}`;
    }
    return {
      url: `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/google-ai-studio/v1beta/models/${model}:generateContent`,
      headers,
    };
  }

  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    headers,
  };
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

function normalizeLocale(raw: unknown): ChatLocale | undefined {
  if (raw === 'en' || raw === 'vi' || raw === 'ko') return raw;
  return undefined;
}

async function callGemini(
  env: Env,
  model: string,
  contents: ReturnType<typeof buildContents>,
  locale?: ChatLocale,
) {
  const { url, headers } = buildGeminiRequest(env, model);
  const localeHint = locale
    ? `\n\nPreferred locale when the user's language is unclear: ${locale}.`
    : '';

  const geminiResponse = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: `${SYSTEM_INSTRUCTION}${localeHint}`,
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

  return geminiResponse;
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
    const locale = normalizeLocale(payload.locale);
    const preferredModel = (env.GEMINI_MODEL || DEFAULT_MODEL).trim();
    const modelsToTry = [
      preferredModel,
      ...FALLBACK_MODELS.filter((item) => item !== preferredModel),
    ];

    let lastFailure: { model: string; status: number; message: string } | null = null;
    let sawLocationBlock = false;

    for (const model of modelsToTry) {
      const geminiResponse = await callGemini(env, model, contents, locale);

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        lastFailure = {
          model,
          status: geminiResponse.status,
          message: trimDetail(errorText),
        };

        if (isLocationBlocked(geminiResponse.status, errorText)) {
          sawLocationBlock = true;
        }

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

    if (sawLocationBlock) {
      return json(
        {
          error: 'Gemini API region blocked.',
          detail: LOCATION_ERROR,
        },
        { status: 503 },
      );
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

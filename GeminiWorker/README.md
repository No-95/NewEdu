# GeminiWorker

Standalone Cloudflare Worker for AI chat proxying to Gemini.

## Endpoints

- POST /ai/chat
- GET /health

## Request format (POST /ai/chat)

{
  "message": "string",
  "history": [
    { "role": "user", "text": "..." },
    { "role": "assistant", "text": "..." }
  ]
}

Required header:

- x-internal-token: <same value as INTERNAL_SHARED_TOKEN secret>

## Setup

1. Install dependencies

pnpm --dir D:/NewEdu/New-HDP-Edu/GeminiWorker install

2. Set Cloudflare Worker secrets

pnpm --dir D:/NewEdu/New-HDP-Edu/GeminiWorker exec wrangler secret put GEMINI_API_KEY
pnpm --dir D:/NewEdu/New-HDP-Edu/GeminiWorker exec wrangler secret put INTERNAL_SHARED_TOKEN
pnpm --dir D:/NewEdu/New-HDP-Edu/GeminiWorker exec wrangler secret put GEMINI_MODEL

3. Local run

pnpm --dir D:/NewEdu/New-HDP-Edu/GeminiWorker dev

4. Deploy

pnpm --dir D:/NewEdu/New-HDP-Edu/GeminiWorker deploy

Or from repo root: `node scripts/sync-gemini-worker-secrets.mjs` then deploy the worker.

## Gemini region errors (FAILED_PRECONDITION)

If you see `User location is not supported`, the Worker was likely running in a blocked Cloudflare colo (e.g. HKG). This project sets:

```toml
[placement]
hostname = "generativelanguage.googleapis.com"
```

in `wrangler.toml` so the Worker runs near Google's API. After deploy, allow ~15 minutes for placement to settle.

Optional: route via [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/providers/google-ai-studio/) (often more reliable):

- `CF_AI_GATEWAY_ACCOUNT_ID`
- `CF_AI_GATEWAY_ID`
- `CF_AIG_TOKEN` (if your gateway requires it)

Also ensure your Google AI Studio project has billing enabled if your country requires it.

## Integrate into your Next.js route

In your app support route, call this Worker instead of calling Gemini directly.

Suggested app env values:

- AI_WORKER_URL=https://<your-worker-subdomain>/ai/chat
- AI_WORKER_INTERNAL_TOKEN=<same as INTERNAL_SHARED_TOKEN>

Then from app/api/support/chat/route.ts:

- keep Convex daily cap logic
- forward message/history to AI_WORKER_URL
- set header x-internal-token with AI_WORKER_INTERNAL_TOKEN
- return Worker response + existing rate-limit headers

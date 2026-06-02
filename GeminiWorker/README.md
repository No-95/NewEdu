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

pnpm --dir D:/NewEdu/GeminiWorker install

2. Set Cloudflare Worker secrets

pnpm --dir D:/NewEdu/GeminiWorker exec wrangler secret put GEMINI_API_KEY
pnpm --dir D:/NewEdu/GeminiWorker exec wrangler secret put INTERNAL_SHARED_TOKEN
pnpm --dir D:/NewEdu/GeminiWorker exec wrangler secret put GEMINI_MODEL

3. Local run

pnpm --dir D:/NewEdu/GeminiWorker dev

4. Deploy

pnpm --dir D:/NewEdu/GeminiWorker deploy

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

# Deploy HDP EDU to Cloudflare Workers

Repo: https://github.com/No-95/NewEdu

## Critical: build-time vs runtime env

| When | What | Where |
|------|------|--------|
| **Build** | `NEXT_PUBLIC_*` (inlined into browser) | [`.env.production`](.env.production) only |
| **Runtime** | Secrets (PayOS, R2 keys, Resend, AI worker) | Cloudflare dashboard or `wrangler secret` |
| **Never** | Put secrets in `.env.production` or commit them | |

`pnpm run build:cloudflare` temporarily moves `.env.local` aside so secrets are **not** baked into the OpenNext bundle.

Always deploy with **`--keep-vars`** so CLI deploys do not wipe dashboard secrets:

```bash
pnpm run deploy:prod
```

## 1. Convex

```bash
npx convex deploy
```

## 2. Production build and deploy (recommended)

```bash
pnpm install
pnpm exec wrangler login
pnpm run deploy:prod
```

This runs `scripts/build-cloudflare-prod.mjs` then `opennextjs-cloudflare deploy -- --keep-vars`.

Worker name: `newedu` (see [`wrangler.jsonc`](wrangler.jsonc)).

URLs:

- https://hdpedu.com
- https://www.hdpedu.com
- https://newedu.minhhoangd852.workers.dev (workers.dev fallback)

## 3. Runtime secrets (Cloudflare dashboard)

Set under **Workers & Pages → newedu → Settings → Variables** (encrypted secrets):

- `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- `RESEND_API_KEY`, `AI_WORKER_INTERNAL_TOKEN`, `GEMINI_API_KEY` (if used on worker)
- `CONVEX_SITE_URL`, `CONVEX_DEPLOYMENT` (optional)
- `SITE_URL` — email notification CTA base URL (optional; defaults to `https://hdpedu.com`)

Plaintext runtime vars (or use [`wrangler.jsonc`](wrangler.jsonc) `vars`):

- `R2_ACCOUNT_ID`, `R2_BUCKET`, `RESEND_FROM_EMAIL`, `AI_WORKER_URL`, `GEMINI_MODEL`
- `R2_PUBLIC_BASE_URL` — optional if `R2_*` credentials are set; HLS uses S3 API when credentials exist

Re-sync from local (skips `NEXT_PUBLIC_*`):

```bash
node scripts/sync-wrangler-secrets.mjs
```

## 4. Book orders (`/books/purchase`)

- Form submits to `POST /api/books/order` → Convex `bookOrders.submitBookOrder` → Resend email.
- On **Convex dashboard**, set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (same as OTP). Optional: `BOOK_ORDER_NOTIFY_EMAIL` (default `minhhoangd852@gmail.com`).

## 5. Transactional email notifications

In-app notifications also send email via `notifyUser` → Resend when the user has email notifications enabled (default **on**).

**Convex environment variables:**

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Required for OTP, book orders, and notification emails |
| `RESEND_FROM_EMAIL` | Sender address |
| `SITE_URL` | Base URL for email CTA buttons (default `https://hdpedu.com`) |

Users can disable email in **Settings → Notification preferences**. In-app notifications are unaffected.

## 6. CV parsing (`/career/ai-matching`)

Requires on **Next.js runtime** (Cloudflare worker):

- `AI_WORKER_URL` — Gemini worker endpoint
- `AI_WORKER_INTERNAL_TOKEN` — shared secret for worker auth

Requires on **Convex**: file storage (upload URL) only; parsing runs in Next API route.

Supported formats: **PDF** (text-based) and **TXT**. Word documents are rejected with a clear message.

## 7. Recruitment stage history backfill (one-time)

After deploying the `recruitmentStageEvents` schema, run once to populate timelines for existing candidates:

```bash
npx convex run employerOps:backfillRecruitmentStageEvents
```

Optional admin gate:

```bash
npx convex run employerOps:backfillRecruitmentStageEvents '{"adminEmail":"admin@example.com"}'
```

Safe to re-run: skips candidates that already have events.

## 8. PayOS webhook

```
https://hdpedu.com/api/purchase/notify/payos
```

## 9. Debugging 500 errors

```bash
pnpm exec wrangler tail newedu
```

Common causes:

- `NEXT_PUBLIC_CONVEX_URL` missing from build → rebuild with `pnpm run deploy:prod`
- Many dashboard uploads without build env → use single `deploy:prod` path only
- `Dynamic require of middleware-manifest.json` → `scripts/patch-opennext-worker.mjs` runs after build
- Next **16.2.x** on OpenNext can 500 with `ComponentMod.handler is not a function` → stay on **Next 15.5.x** until upstream fixes ([issue #1258](https://github.com/opennextjs/opennextjs-cloudflare/issues/1258))
- Windows build: run `node scripts/patch-opennext-symlink.mjs` before build (standalone symlink EPERM)

## 10. Course test price

```powershell
$env:NEXT_PUBLIC_CONVEX_URL="https://adept-tapir-159.convex.cloud"
$env:COURSE_PRICE="399000"
node scripts/set-course-price.mjs
```

## 11. Do not use parallel deploy paths

Avoid mixing **34+ manual dashboard uploads** with CLI deploys without the same env. Pick **CLI `deploy:prod`** or Workers Builds with **Build variables** matching `.env.production`.

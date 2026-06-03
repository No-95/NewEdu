# Deploy HDP EDU to Cloudflare Workers

Repo: https://github.com/No-95/NewEdu

## 1. Convex

```bash
npx convex deploy
```

Set `NEXT_PUBLIC_CONVEX_URL` in Cloudflare to your deployment URL (e.g. `https://adept-tapir-159.convex.cloud`).

## 2. Build and deploy (CLI)

```bash
pnpm install
pnpm exec wrangler login
pnpm run deploy
```

Worker name: `newedu` (see `wrangler.jsonc`).

## 3. Cloudflare environment variables

In **Workers & Pages → newedu → Settings → Variables**, add:

| Name | Type | Notes |
|------|------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | Plain | Convex deployment URL |
| `NEXT_PUBLIC_APP_URL` | Plain | `https://newedu.<subdomain>.workers.dev` or custom domain |
| `PAYOS_CLIENT_ID` | Secret | |
| `PAYOS_API_KEY` | Secret | |
| `PAYOS_CHECKSUM_KEY` | Secret | |
| `RESEND_API_KEY` | Secret | OTP email |
| `RESEND_FROM_EMAIL` | Plain | |
| `R2_PUBLIC_BASE_URL` | Plain | HLS base URL |
| `R2_ACCESS_KEY_ID` | Secret | If using private R2 in API routes |
| `R2_SECRET_ACCESS_KEY` | Secret | |
| `R2_ACCOUNT_ID` | Plain | |
| `R2_BUCKET` | Plain | |
| `AI_WORKER_URL` | Plain | Gemini worker URL |
| `AI_WORKER_INTERNAL_TOKEN` | Secret | |

After first deploy, set `NEXT_PUBLIC_APP_URL` to the live URL and redeploy.

## 4. PayOS webhook

Register in PayOS dashboard:

```
https://YOUR_DOMAIN/api/purchase/notify/payos
```

## 5. Course test price

```powershell
$env:NEXT_PUBLIC_CONVEX_URL="https://adept-tapir-159.convex.cloud"
$env:COURSE_PRICE="2000"
node scripts/set-course-price.mjs
```

## 6. GitHub → Cloudflare (optional)

Connect repo `No-95/NewEdu`, branch `main`, root `/`.

Build: `pnpm install && CF_PAGES=1 pnpm run build`  
Or use local `pnpm run deploy` after `wrangler login`.

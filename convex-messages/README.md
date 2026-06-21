# Convex Messages (second deployment)

Private messaging backend for HDP EDU.

**Production URL:** `https://fantastic-kookabura-624.convex.cloud`  
**Site URL:** `https://fantastic-kookabura-624.convex.site`  
**Dashboard:** https://dashboard.convex.dev/t/alwaybusy-hoang/mesg/fantastic-kookabura-624

## Deploy (fantastic-kookabura-624)

This deployment is on team `alwaybusy-hoang` (project `mesg`). Use a **Production Deploy Key**:

1. Copy `convex-messages/.env.deploy.example` → `.env.deploy.local`
2. Paste `CONVEX_DEPLOY_KEY=prod:fantastic-kookabura-624|...` from Convex dashboard
3. Run:

```bash
pnpm run deploy:messages:fantastic
```

## Deploy (hdp-messages fallback on minhhoangd852 team)

```bash
pnpm run deploy:messages
```

## Required environment variables (Convex prod)

| Variable | Purpose |
|----------|---------|
| `MESSAGES_NOTIFY_SECRET` | Auth for POST to Next.js `/api/messages/notify` |
| `SITE_URL` | Base URL for notify bridge (e.g. `https://hdpedu.com`) |

## Schema

- `messageProfiles` — cached display names/avatars keyed by email
- `conversations` — 1:1 threads between two user emails
- `messages` — message bodies with read receipts

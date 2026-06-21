# Convex Messages (second deployment)

Private messaging backend for HDP EDU.

**Production URL:** `https://dapper-cricket-274.convex.cloud`  
**Dashboard:** https://dashboard.convex.dev/t/minhhoangd852/hdp-messages

## Setup

```bash
cd convex-messages
npm install
npx convex dev
```

## Deploy

From repo root:

```bash
pnpm run deploy:messages
```

## Required environment variables (Convex prod dashboard)

| Variable | Purpose |
|----------|---------|
| `MESSAGES_NOTIFY_SECRET` | Auth for POST to Next.js `/api/messages/notify` |
| `SITE_URL` | Base URL for notify bridge (e.g. `https://hdpedu.com`) |

## Schema

- `messageProfiles` — cached display names/avatars keyed by email
- `conversations` — 1:1 threads between two user emails
- `messages` — message bodies with read receipts

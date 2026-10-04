# Fit Z

Fit Z is a private, installable fitness journal for desktop and mobile. It stores routines, workout sessions, body weight, waist measurements and per-muscle training volume.

This repository is the independent Cloudflare edition. It does not require ChatGPT or a ChatGPT subscription.

## Stack

- Vinext, React and TypeScript
- Cloudflare Workers for the app and API
- Cloudflare D1 for durable synchronized data
- Cloudflare Access for passwordless email authentication
- Browser storage and a service worker for pending offline changes

## Before deploying

Follow `GUIA-INSTALACION.md`. You must replace both placeholders in `wrangler.jsonc`:

- `REPLACE_WITH_YOUR_EMAIL`
- `00000000-0000-4000-8000-000000000000`

## Commands

```bash
pnpm install
pnpm run test
pnpm run typecheck
pnpm run build
pnpm run db:migrate:remote
pnpm run deploy
```

## Data and security

Cloudflare Access must protect the Worker before real data is stored. Fit Z accepts the authenticated email header only when it exactly matches `FITZ_OWNER_EMAIL`. The API validates every record, checks same-origin writes and uses revision-based optimistic concurrency. Deletions use tombstones so an older device cannot silently restore deleted data.

All user records are stored in D1. The browser keeps a local cache and pending operations, allowing an interrupted workout to resume and synchronize later. Export options include CSV, a complete JSON backup, JSON restoration and a text summary.

## Verification

```bash
pnpm run test
pnpm run typecheck
pnpm run build
```

The automated tests cover routine parsing, completed-set volume, previous-session defaults, CSV escaping, account isolation, write conflicts and deletion tombstones.

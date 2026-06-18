# Cloudflare Demo Deploy

This is a browser-hosted demo mode for the `next` UI. It is not the macOS app bundle and it does not run the local daemon on Cloudflare.

## What Works

- The `next` React UI runs from Cloudflare Pages static assets.
- Python-only content/source assets, scenario templates, and hidden scenario tests are generated into `dist/web/cloud-data`.
- Python runs in the browser through Pyodide.
- User data, workspace state, and scenario attempts persist in browser `localStorage`.
- Guided coach and scenario interviewer/debrief requests go through Cloudflare Functions to OpenRouter.
- A simple password screen protects the whole site.

## Intentional Limits

- No local daemon, native wrapper, local folder opening, VS Code/Cursor opening, or file-system-backed workspaces.
- No TypeScript, Go, or Scala problem runners or language selectors in the browser demo.
- No hosted database in this first pass; state is per browser.
- No Ollama in cloud mode. OpenRouter is the cloud AI path.
- Hidden tests are practice gating, not a security boundary. An authenticated user could inspect static assets.

## Build

```bash
cd next
bun install
bun run build:cloud
```

The output directory is:

```text
next/dist/web
```

## Local Preview

Create local development secrets:

```bash
cd next
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`, then run:

```bash
bun run cloud:preview
```

The auth cookie omits the `Secure` flag on local `http://` preview and uses `Secure` in production.

## Cloudflare Pages Settings

For Git-connected Pages:

```text
Root directory: next
Build command: bun install && bun run build:cloud
Build output directory: dist/web
Functions directory: functions
```

For Wrangler deploy:

```bash
cd next
bun run build:cloud
bunx wrangler pages deploy dist/web --project-name dsa-coach-next
```

## Required Secrets

Set these in Cloudflare Pages project settings or with `wrangler pages secret put`.

```text
SESSION_SECRET       Long random string used to sign the demo session cookie.
DEMO_PASSWORD        Shared demo password.
OPENROUTER_API_KEY   OpenRouter API key. Never expose this in Vite env vars.
OPENROUTER_MODEL     Exact OpenRouter model slug to use.
```

Instead of `DEMO_PASSWORD`, you can set:

```text
DEMO_PASSWORD_SHA256 SHA-256 hex digest of the shared demo password.
```

Optional:

```text
OPENROUTER_HTTP_REFERER   Public demo URL for OpenRouter attribution.
OPENROUTER_APP_TITLE      App title for OpenRouter attribution, for example DSA Coach.
```

## Secret Commands

```bash
cd next
bunx wrangler pages secret put SESSION_SECRET --project-name dsa-coach-next
bunx wrangler pages secret put DEMO_PASSWORD --project-name dsa-coach-next
bunx wrangler pages secret put OPENROUTER_API_KEY --project-name dsa-coach-next
bunx wrangler pages secret put OPENROUTER_MODEL --project-name dsa-coach-next
```

## What I Need From You

- The Cloudflare Pages project name you want, unless `dsa-coach-next` is fine.
- The exact OpenRouter model slug for the Gemma model you want to use.
- The demo password or a SHA-256 hash of it.
- Whether you want a custom domain or the default `*.pages.dev` URL.

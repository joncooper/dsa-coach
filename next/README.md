# DSA Coach Next

`next/` is the active native generation of DSA Coach. It combines a React UI, a local daemon, file-backed practice state, browser-worker Pyodide execution for Python, optional local Ollama coaching, and Codex SDK interviewer flows for repo-style scenarios.

The root `src/` app is the older browser/PWA generation. It is still useful reference code, but native practice surfaces should be developed and reviewed here.

![Native dashboard](../ui-snapshots/native-dashboard.png)

## Quick Start

Prerequisites:

- macOS
- Bun 1.3.2 or newer
- Xcode Command Line Tools or another Swift toolchain for macOS packaging
- Go and Java for the full packaged runtime and non-Python toolchain support
- Optional: Ollama for local guided coaching
- Optional: Codex/OpenAI credentials for scenario interviewer and debrief features

Build and verify:

```bash
bun install
bun run build
bun test
bun run verify:content
```

Run the development app in two terminals:

```bash
bun run daemon
```

```bash
bun run web:dev
```

Open the Vite URL printed by `web:dev`, usually `http://127.0.0.1:5174`.

Package and launch the native macOS app:

```bash
bun run package:mac
open -n "dist/macos/DSA Coach Next.app"
```

The packaged app starts a local production host on an OS-assigned localhost port, serves the built web UI and daemon API from one process, and shuts that host down when the app exits. Generated app bundles are not committed to the repository. Share `dist/macos/DSA Coach Next.app` or a zip of it as a release artifact when a prebuilt binary is needed.

## Cloudflare Demo Build

For a browser-hosted demo:

```bash
bun run build:cloud
```

This writes the Vite app and generated static content/source/scenario assets to `dist/web`. Cloud mode keeps user progress in browser storage, exposes Python-only problem workspaces, runs Python through Pyodide, disables host LSP and local runners, and proxies coach/interviewer calls through Cloudflare Functions to OpenRouter. For this demo, use `OPENROUTER_MODEL=google/gemma-4-31b-it` for Gemma 4; keep `OPENROUTER_API_KEY`, the demo password, and the session secret in Cloudflare Pages secrets or local `.dev.vars` only. Deployment details are in [`docs/cloudflare-deploy.md`](docs/cloudflare-deploy.md).

## Current Product Surfaces

- Dashboard and global catalog navigation.
- Guided problem workspaces with prompt, CodeMirror editor, scratchpad/notes, Pyodide visible and hidden tests, and optional coach panel.
- CodeSignal ICF practice with progressive four-level assessments.
- Ramp Onsite rehearsals with prompt, multi-file Python editor, resizable test dock, hidden-test/debrief flow, and Codex SDK interviewer support.
- Ramp AI backend drills with repo-style Python scenarios and debrief scoring.

![Ramp onsite workspace](../ui-snapshots/ramp-hotel-workspace.png)

![Scenario test diagnostics](../ui-snapshots/ramp-hotel-tests.png)

## Python Runtime Policy

Python practice execution is browser-worker/Pyodide, not local subprocess Python.

This includes:

- guided problem runs and submissions
- scratchpads
- CodeSignal assessment levels
- Ramp Onsite visible tests
- Ramp scenario hidden/debrief tests

The daemon still owns content loading, persistence, scenario metadata, local AI calls, Codex integration, packaging host duties, and non-Python toolchain support. It should not be used as the Python runtime for candidate submissions.

Pyodide is an explicit dependency of this package and is served by the web build at `/pyodide/`.

## Optional AI Setup

The guided-problem coach uses Ollama at `http://127.0.0.1:11434` and expects `gemma4:latest` by default:

```bash
ollama pull gemma4:latest
OLLAMA_ORIGINS="*" ollama serve
```

The scenario interviewer and debrief generator use `@openai/codex-sdk`, installed by `bun install`. Make sure Codex/OpenAI credentials are available in the environment that starts `bun run daemon`, `bun run desktop:host`, or the packaged app host.

Optional model override:

```bash
export DSA_COACH_CODEX_MODEL="your-codex-model"
```

If Ollama or Codex is unavailable, the app should show status/setup guidance while leaving the editor and test harness usable.

## Scripts

```bash
bun run build                 # Type-check and build the native web UI
bun run build:cloud           # Build the Cloudflare Pages demo bundle
bun test                      # Bun test suite
bun run verify:content        # Validate authored content graph
bun run daemon                # Local development daemon API
bun run web:dev               # Vite development UI
bun run desktop:host          # Production host used by the macOS wrapper
bun run package:mac           # Build the double-clickable macOS app bundle
bun run package:mac:release   # Release packaging variant
bun run cloud:preview         # Build and run Cloudflare Pages locally through Wrangler
bun run cloud:deploy          # Build and deploy dist/web through Wrangler
bun run setup:toolchains      # Install cached non-Python toolchains
bun run setup:lsp             # Install language servers and formatters
bun run check:lsp             # Report available language-server tooling
bun run verify:lsp:fast       # Verify TypeScript, Python, and Go IDE features
bun run verify:lsp            # Verify the full LSP matrix, including Scala
bun run verify:runner-backends # Verify host runner backends
bun run verify:sandbox        # Verify local sandbox behavior where available
```

## Architecture

```text
apps/web/              React UI, CodeMirror editor, Pyodide workers
content/               Authored graph content, assessments, and scenarios
src/content/           Content loading and graph validation
src/daemon/            Local API for content, storage, coach, Codex, and host duties
src/ai/                Codex SDK provider
src/runner/            Host-runner scaffolding for non-Python languages
src/scenarios/         Scenario workspace and debrief helpers
src/storage/           User data records and backup migration
scripts/               Packaging, setup, verification, migration, and reporting tools
tests/                 Bun tests for content, daemon, runner, and scenario behavior
```

High-level flow:

```text
React UI -> Pyodide worker -> Python run results
React UI -> daemon API -> content, persistence, coach, Codex, package host
React UI -> daemon API -> non-Python language packs when those surfaces need host tooling
```

## Useful Environment Variables

```text
VITE_DSA_DAEMON_URL              Override the daemon URL used by the web UI
DSA_COACH_NEXT_PORT              Choose the local daemon/host port
DSA_COACH_STATIC_ROOT            Static web build root for desktop host
DSA_COACH_CONTENT_ROOT           Override content directory
DSA_COACH_USER_DATA_DIR          Override native user-data location
DSA_COACH_RUNTIME_STATUS_PATH    Write runtime status for host/wrapper coordination
DSA_COACH_CACHE_ROOT             Override writable cache root
DSA_COACH_CODEX_MODEL            Optional Codex SDK model override
```

## Data Locations

The packaged app writes user data outside the bundle, normally at:

```text
~/Library/Application Support/DSA Coach Next/User Data
```

Writable runner caches live beside the user-data directory. The app bundle itself should remain disposable.

## Notes For Maintainers

- Do not reintroduce local Python subprocess execution for in-app Python practice.
- Keep Ramp and CodeSignal coding surfaces visually aligned with the mature guided-problem workspace.
- Hidden tests are a practice-quality tool, not a security boundary.
- Old scenario attempts may contain legacy command labels. Fresh Python runs should report `Pyodide unittest`.

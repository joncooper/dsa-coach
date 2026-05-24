# DSA Coach Next

This directory is a from-scratch architecture prototype for a local, offline-after-setup,
multi-language version of DSA Coach.

The existing app remains untouched. This prototype proves the new shape:

- content is a normalized graph loaded from small files;
- modules, tracks, and problem sets reference canonical problems by ID;
- languages are discovered from language packs instead of hardcoded in the UI;
- execution flows through a normalized local-runner contract;
- the TypeScript backend runs every executable reference solution against JSON tests;
- the active content graph contains all 256 migrated legacy problems with Python,
  TypeScript, Go, and Scala starter/reference files;
- multi-part AOC problems and assessment levels are represented with part-specific
  source files and runner support;
- legacy backup import preserves progress, buffers, submissions, assessments, preferences, and coach logs.

## Commands

```bash
bun run test
bun run build
bun run verify:content
bun run inventory:legacy
bun run coverage:translations
bun run setup:toolchains
bun run setup:lsp
bun run check:lsp
bun run verify:lsp:fast
bun run verify:lsp
bun run verify:runner-backends
bun run verify:sandbox
```

`migrate:legacy-batch` regenerates the currently migrated content slice from
the legacy course data:

```bash
bun run migrate:legacy-batch
```

To try the vertical slice locally, run these in two terminals:

```bash
cd next
bun run daemon
```

```bash
cd next
bun run web:dev
```

Then open the Vite URL, usually `http://127.0.0.1:5174`.

## Runner Backends

The daemon currently has executable backends for:

- TypeScript through a transpile-and-run Node process backend;
- Python through `python3` in an isolated temporary workdir;
- Go through `go test -c` plus an isolated test-binary run;
- Scala through a pinned local Scala 3 toolchain and direct JVM compiler/runtime
  invocation.

Run the one-time setup step before using Scala on a fresh clone:

```bash
bun run setup:toolchains
```

After setup, the downloaded toolchain lives under `next/.runner-cache`, so the
runner remains usable without network access. Process runs use macOS
`sandbox-exec` when available: network is denied, writes are restricted to the
run directory, and Go compile-cache writes are restricted to
`next/.runner-cache`. Go compilation has to allow compiler/linker subprocesses;
user code runs as the compiled test binary under the stricter runtime profile.
The current macOS sandbox profile still permits broad file reads, so it is a
local damage-containment layer rather than a complete confidentiality boundary.

Run the LSP setup step once to install project-local language servers for editor
autocomplete:

```bash
bun run setup:lsp
```

The setup command uses package-managed TypeScript and Python servers from
`node_modules/.bin`, installs `gopls` into `next/.runner-cache/lsp/bin`, and
installs Metals there through Coursier, and installs formatter tools (`ruff`
and `scalafmt`) into the same local cache. `bun run check:lsp` reports what the
daemon can currently resolve without installing anything. `bun run
verify:lsp:fast` exercises the complete IDE feature path for TypeScript,
Python, and Go; `bun run verify:lsp` also includes Scala/Metals, which can take
substantially longer on a cold local cache.

The explicit backend verifier runs every reference target for selected
languages:

```bash
bun run scripts/verify-runner-backends.ts --languages=typescript,python,go,scala
```

## Editor

The web app uses CodeMirror 6 for the code editor, with line numbers, syntax
highlighting, indentation, bracket matching, history, search, lint gutter,
hover documentation, signature help, format, go-to-definition, document
symbols, and problem navigation. Completion suggestions come from the
daemon-backed Language Server Protocol sessions when a server is available, then
fall back to active problem signatures, local symbols, and language-specific
keywords and snippets when a server is unavailable or slow. Formatting uses the
language server when supported and falls back to the language pack formatter
binary.

## Directory Shape

```text
content/              File-authored graph content and language solutions
docs/                 Architecture and migration plan
src/core/             Content, language, and result contracts
src/content/          Content loader
src/languages/        Language pack registry
src/lsp/              Generic stdio LSP client and completion normalization
src/runner/           Local runner contracts and prototype backend
src/storage/          Typed user data records and legacy backup migration
scripts/              Legacy inventory, coverage, and batch migration tooling
src/cli/              Verification and local daemon entry points
tests/                Bun tests for graph validation and runner behavior
```

This is not intended to replace the current app yet. It is the architectural
base for a rewrite where the browser UI talks to a localhost runner daemon and
the daemon runs language packs in sandboxed environments.

# DSA Coach Next Architecture Plan

## Goals

The rewrite should support this deployment model:

1. Clone the repository.
2. Run one setup command while online.
3. Use the app locally without network access after setup.
4. Add new programming languages without changing the web UI, content model,
   progress model, or scoring code.

The app should remain a learning product, not a public online judge. Hidden
tests are practice integrity, not a security boundary.

## Product Shape

DSA Coach Next is a local platform with two processes:

- A static browser UI served from localhost.
- A local app daemon that owns content, persistence, language metadata, service
  orchestration, and non-Python host-runner execution.
- Browser-worker Pyodide execution for Python practice, including guided
  problems, scratchpads, assessments, and scenario tests.

The browser renders the course, editor, results, notes, progress, and coach
surface. The daemon exposes content, language metadata, persistence, and
non-Python run endpoints. Python candidate code runs in the browser worker and
only persists results back through the daemon.

```text
Browser UI -> Pyodide worker -> Python results
Browser UI -> localhost daemon -> non-Python language pack -> sandbox/toolchain
```

## Repository Shape

```text
apps/
  web/                  React UI
  runner-daemon/         Local HTTP API and sandbox orchestration
packages/
  core/                  Content graph, progress, scoring, run contracts
  storage/               IndexedDB/file backup schemas and migrations
  language-sdk/          Language pack interfaces and test harness helpers
content/
  catalog.json
  modules/
  problem-sets/
  problems/
  quizzes/
  assessments/
languages/
  python/
  typescript/
  go/
  scala/
```

This prototype keeps those layers under `next/src` until the boundaries prove
themselves.

## Content Graph

Content is authored as many small files and loaded into a normalized graph.
Problems are canonical. Modules, problem sets, assessments, tracks, and review
queues all reference problem IDs instead of copying problem definitions.

Important entities:

- `Track`: top-level navigation group, such as Modules, Problem Sets, Libraries.
- `Module`: curricular sequence of lessons, problems, and quizzes.
- `ProblemSet`: curated playlist of canonical problems with optional category metadata.
- `Problem`: prompt, signature, tests, parts, and per-language implementation files.
- `Assessment`: timed or staged view over canonical problems and parts.

Build/setup validation must fail when:

- IDs collide.
- A reference points to a missing node.
- A problem has no visible or hidden tests.
- A language entry references a missing starter or reference file.
- A claimed language pack is not installed.
- A reference solution for an installed executable language fails tests.

## Language Packs

A language pack is a manifest plus optional templates, harnesses, formatter,
LSP configuration, and toolchain setup instructions.

The UI knows only the language pack metadata:

- ID and display label.
- File extensions.
- Whether execution is installed.
- Whether formatting/completion is available.
- What runner strategy is used.

The runner daemon knows how to execute it.

Adding a language should require:

1. Add a language pack directory.
2. Provide harness templates and toolchain setup.
3. Add starter/reference files for problems that support it.
4. Run setup and verification.

It should not require changes to routing, persistence, scoring, or workspace UI.

## Runner Model

All languages return the same result shape:

```ts
type RunStatus =
  | "passed"
  | "failed"
  | "compile-error"
  | "runtime-error"
  | "timeout"
  | "unsupported";
```

Run requests include:

- language ID;
- problem ID and optional part ID;
- source code;
- test visibility selection;
- timeout and sandbox limits.

Test cases are JSON-first. Language harnesses adapt JSON values into native
types, call the user's entrypoint, normalize outputs, and compare with expected
values or validators.

## Sandboxing

The preferred runner strategy is containerized:

- no network;
- read-only runtime image;
- temporary writable working directory;
- CPU, memory, process, and output limits;
- per-run cleanup.

Host-process runners are acceptable for trusted local mode and fast prototypes,
but the UI should label them as less isolated.

## Offline Setup

The setup command should fetch or build everything needed:

- JavaScript dependencies;
- web build assets;
- runner daemon binary;
- container images or toolchains;
- LSP servers;
- package caches;
- content verification artifacts.

After setup, the app should support an explicit offline run mode that refuses
network access and uses only local caches.

## Web UI Architecture

The React app should be thin over core contracts:

- routing and layout;
- editor and workspace controls;
- progress views;
- notes/history/import/export;
- coach UI.

The workspace should be shared across normal problems, multi-part problems,
assessments, and scratchpads. Modes configure the workspace instead of
duplicating execution and autosave logic.

## Persistence

Progress should be derived from typed records:

- problem attempts;
- per-part progress;
- quiz attempts;
- lesson checkpoint state;
- assessment sessions and scorecards;
- editor buffers;
- notes;
- UI preferences.

Imports must validate before clearing existing data. Migrations should be
versioned independently of Dexie store versions.

## Legacy User Data Migration

The rewrite must migrate data from the current browser-only app that the user
has already been using on this machine. The current app stores user data in
browser IndexedDB (`dsa-coach`) and exports it through the existing "Export
progress" flow. The new app cannot reliably read another browser origin's
IndexedDB directly, so migration has two supported paths:

1. Recommended: open the current app, export progress JSON, then import that
   file into DSA Coach Next during first-run setup.
2. Convenience path: if the rewrite is served on the same origin during a
   transition build, offer an in-browser migration wizard that reads the
   legacy Dexie database before switching storage schemas.

The migration must preserve:

- lesson, problem, and quiz progress;
- spaced-review `dueAt` data and checkpoint scores;
- notes;
- run/submission history;
- problem editor buffers from `code:<problemId>` and
  `code:<problemId>#<partId>` settings;
- scratchpads from `scratchpad:<problemId>`;
- assessment session state, level code buffers, finish snapshots, scorecards,
  and scorecard history;
- UI preferences;
- starred problems;
- coach conversations, prompt snapshots, model names, responses, and feedback.

The migration should not try to infer a new language from legacy code. All
legacy editor buffers and submissions are Python and should be stored with
`language: "python"`. Future multi-language work can add additional buffers
beside the migrated Python buffers.

Import safety requirements:

- Validate the legacy backup before writing any new storage.
- Never clear existing Next data until validation and a dry-run summary pass.
- Keep the raw legacy backup in an archival `legacySnapshots` collection so
  future migrations can recover fields that were not yet mapped.
- Produce a migration report with record counts, warnings, and skipped fields.
- Let the user download the report.

The prototype includes a pure backup migration function under
`src/storage/legacyMigration.ts`; the production app should wrap that with a UI
wizard and storage transaction.

## Migration Path

1. Keep current app shipping.
2. Build `next/` as an executable prototype.
3. Move content into canonical graph files.
4. Implement legacy backup import and verify it against a real export from
   this machine before replacing any current UI.
5. Add a runner daemon with TypeScript and Python packs.
6. Move the existing React UI to graph APIs.
7. Add Go through a container pack.
8. Add Scala as a server/daemon-backed language pack.
9. Replace Pyodide-specific UI paths with generic workspace contracts.
10. Switch CI to production-build Playwright and content/reference verification.

## Near-Term Prototype Scope

This prototype implements:

- content graph types;
- file-based content loader;
- graph validator;
- language pack registry;
- normalized runner contract;
- sandboxed host-process backends for TypeScript, Python, Go, and Scala;
- one-time local toolchain setup for Scala 3 under `next/.runner-cache`, so the
  installed runner remains offline-capable after setup;
- legacy backup migration mapping and tests;
- migrated `foundations`, `arrays-strings`, `hashing`,
  `two-pointers-sliding-window`, `stacks-queues`, `linked-lists`, `trees-graphs`,
  `heaps`, `greedy`, `binary-search`, `backtracking`, and
  `dynamic-programming`, and `interview-tools` module slices, with all thirteen
  full legacy course modules now represented in the graph;
- the `interview-prep`, AOC year, assessment, `lib-sortedcontainers`, and
  `lib-ordered-dict` problem sets represented as canonical problem references;
- part-aware source loading and execution for AOC Part 2 prompts, interview-prep
  follow-ups, and progressive assessment levels;
- Python, TypeScript, Go, and Scala starter/reference files for all 256 legacy
  problems;
- content inventory and translation coverage scripts;
- reference verification across every executable migrated problem for
  TypeScript, Python, Go, and Scala.

Current migration coverage is intentionally tracked, not hidden. Run
`bun run inventory:legacy` to inspect the legacy corpus and
`bun run coverage:translations` to see how much of it has been migrated into
the Next content graph by language.

It deliberately does not implement real container sandboxing yet. The current
macOS backend runs each attempt in an isolated temporary workdir under
`sandbox-exec` when available, denies network access, and restricts writes to the
run directory plus explicit tool caches. TypeScript, Python, Scala runtime
execution, and the compiled Go test binary use restricted process-exec profiles.
The Go compile phase is less strict because the Go toolchain must fork/exec its
compiler and linker; user code is not executed during that compile phase and CGO
is disabled.

The remaining sandbox caveat is file reads: the current macOS profile allows
broad `file-read*` so toolchains and dynamic runtimes work reliably. That means
the sandbox now prevents network access, subprocess escapes, and writes outside
the allowed directories, but it is not yet a complete confidentiality boundary.
A future hardening pass should move to per-toolchain read allowlists or a
container/microVM backend on platforms where that is practical.

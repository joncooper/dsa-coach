# Agent Notes

## Product Shape

- The repository has two app generations. The root `src/` app is the mature browser/Pyodide DSA Coach. The `next/` directory is the native rewrite: React UI, daemon API for content/storage/Codex integration, local scenario workspaces for persistence, and macOS packaging.
- For work on native practice flows, treat `next/` as the active app unless the user explicitly asks for the legacy browser app.
- The user values the existing in-app editor, Pyodide Python runner, and test harness. Preserve that flow and make external folders, diffs, VS Code, Cursor, or local terminal execution secondary escape hatches rather than the main practice surface.

## Python Execution Policy

- Python practice execution in the app should be browser-worker/Pyodide, not local subprocess Python. This includes guided problems, assessments, scratchpads, Ramp onsite/scenario visible tests, and hidden/debrief test flows.
- Do not route Python candidate code through `python3`, `python -m unittest`, `next/src/runner/processBackends.ts`, `next/src/runner/localRunner.ts`, `next/src/runner/scratchpadRunner.ts`, daemon `/run`, daemon `/scratchpad`, or daemon `/scenarios/run-visible` / `/scenarios/submit-hidden` for in-app practice behavior.
- Treat local-process runner files, daemon endpoints, scenario command fields, and runner backend tests as non-Python host-runner scaffolding unless the user explicitly asks to audit or remove them. New or fixed Python app behavior should use Pyodide worker APIs and served `/pyodide/` assets.
- `next/package.json` must explicitly own the `pyodide` dependency used by the native web app. Do not rely on the root app dependency to make Pyodide available to `next/` builds or packaged macOS bundles.
- The native daemon may still own content loading, user-data persistence, scenario workspace files, Codex/interviewer calls, packaging host duties, and other non-execution services. It should not be the Python runtime for candidate submissions.
- Local Python may be used only as an external developer convenience when explicitly requested or when running repository maintenance commands outside the app; it must not be presented as the app's execution path.

## Ramp Onsite Practice Mode

- This is a local practice environment, not a live CodeSignal or Ramp assessment.
- The Ramp Onsite Hotel Reservation Service scenario should feel like working inside the app: editable Python files, visible tests, test output, and debrief/hidden-test flow all in the native app.
- Ramp Onsite Python tests should run through Pyodide in the app, using current editor buffers. Save/flush files for persistence and interviewer visibility, but do not depend on local `python` or unittest subprocesses to produce in-app results.
- Use the mature guided-problem workspace as the visual baseline for coding surfaces. Ramp/CodeSignal-like modes should not become a separate-looking app; add only the mode-specific pieces needed for interview practice.
- For interview/scenario workspaces: keep Prompt first-class and visible by default on the left; move Plan, Scratchpad, and Notes into the right support pane beside Interviewer/Coach; keep Workspace Diff and Local Folder out of the default visible flow.
- Scenario panes must scroll independently during active coding. The page itself should not become one giant scroll surface; prompt, editor, tests/results, and right support pane need their own scrolling, with headers pinned where useful.
- Timers are training instrumentation, not pressure chrome. They should be lightweight, unobtrusive, hideable, pausable, and restartable; avoid vivid countdown/overdue presentation unless the user opts into it.
- Scenario test output should harmonize with the standard runner: passing tests collapsed by default, failing tests auto-expanded, failed rows foregrounding Input / Expected / Actual, with traceback/details secondary and collapsible. Syntax/import/run-level errors must be visible instead of showing all tests as merely "not run".
- Relevant scenario files:
  - `next/content/scenarios/ramp-hotel-reservations/scenario.json`
  - `next/content/scenarios/ramp-hotel-reservations/prompt.md`
  - `next/content/scenarios/ramp-hotel-reservations/template/src/reservations.py`
  - `next/content/scenarios/ramp-hotel-reservations/template/tests/test_reservations.py`
  - `next/content/scenarios/ramp-hotel-reservations/hidden-tests/test_reservations_hidden.py`
- Scenario UI/API files recently involved:
  - `next/apps/web/src/ScenarioScreens.tsx`
  - `next/apps/web/src/CodeEditor.tsx`
  - `next/apps/web/src/styles.css`
  - `next/src/scenarios/scenarioRunner.ts`
  - `next/src/daemon/server.ts`
  - `next/tests/daemon.test.ts`

## Interviewer/Observer Requirements

- In this mode, the Codex SDK/interviewer must be able to observe what the candidate is doing in the in-app IDE and how tests are running.
- Keep current editor contents, visible test run history, hidden/debrief state, and workspace diff available to the scenario/interviewer path.
- Flush/save the active in-app editor file before running visible tests, asking the coach, judging, opening external tools, submitting hidden tests, or ending the session.
- Hidden tests should remain gated until the session is ended/debrief is open.

## Native App Verification

- When the user asks to work on or verify the native app, use the Computer Use tooling against the macOS app UI. Do not verify primarily through Chrome or the web unless the user explicitly requests it.
- Build/package from `next/` with:

```bash
bun run build
bun run package:mac
```

- Launch the exact app bundle for the current worktree when verifying, for example:

```bash
open -n "/Users/jdc/.codex/worktrees/5138/dsa-coach/next/dist/macos/DSA Coach Next.app"
```

- Stale `DSA Coach Next.app` instances from other worktrees may already be running. When using Computer Use, target the exact absolute app path for the current worktree.
- In-app verification for the Ramp scenario should confirm the scenario index copy, editable file tabs, editor save state, visible test output, and that running tests uses the current editor buffer.
- Ramp scenario verification should also cover syntax-error/current-buffer behavior: introduce an invalid Python edit, run visible tests, and confirm the test pane shows the run-level traceback/error rather than stale results or only "not run" rows.
- Verification should confirm Python execution succeeds without requiring a system Python interpreter. Pyodide assets should be served from the app bundle/web build at `/pyodide/`.
- Old scenario attempts may still display legacy command strings such as `python3 -m unittest` in saved run history. For Pyodide verification, run a fresh test from the current build and confirm the new run reports `Pyodide unittest`.
- If Computer Use can observe the native app but direct click/type actions fail, recursive macOS Accessibility scripting via `System Events` is an acceptable fallback for native-app interaction. Keep the target app path explicit so stale app instances from other worktrees are not inspected by mistake.

## Commands And Caveats

- Main `next/` checks:

```bash
bun run build
bun test
bun run package:mac
```

- Daemon tests can fail inside the sandbox because loopback/listen behavior is restricted. If the failure is a sandbox-only listen/port issue, rerun the important test command outside the sandbox with approval.
- Root-level dependencies may still matter for `next/` builds because some shared/legacy modules are imported during bundling.

## Context Recovery

- Prior Codex threads on this project can contain useful context, but thread search/readback may be incomplete. Prefer the repo, this file, README files, compacted summaries supplied in the current thread, and direct code inspection as the source of truth.
- Start by exploring before editing. The repo has several overlapping practice surfaces, and the right behavior is often already implemented elsewhere.

# Agent Notes

## Product Shape

- The repository has two app generations. The root `src/` app is the mature browser/Pyodide DSA Coach. The `next/` directory is the native/local-runner rewrite: React UI, daemon API, local scenario workspaces, language runners, and macOS packaging.
- For work on native practice flows, treat `next/` as the active app unless the user explicitly asks for the legacy browser app.
- The user values the existing in-app editor, Python runner, and test harness. Preserve that flow and make external folders, diffs, VS Code, or Cursor secondary escape hatches rather than the main practice surface.

## Ramp Onsite Practice Mode

- This is a local practice environment, not a live CodeSignal or Ramp assessment.
- The Ramp Onsite Hotel Reservation Service scenario should feel like working inside the app: editable Python files, visible tests, test output, and debrief/hidden-test flow all in the native app.
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

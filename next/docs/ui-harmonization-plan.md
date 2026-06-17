# UI Harmonization Plan

## Baseline

The mature guided-problem workspace is the baseline visual language for the native app:

- steady global sidebar
- quiet page header
- first-class prompt pane on the left
- editor as the primary work surface
- bottom output/test dock
- optional right support pane only when the mode needs it

Ramp Onsite, Ramp AI Backend, and CodeSignal-style assessment modes should reuse this language. They can add multi-file editing, interview support, visible/hidden tests, and debrief flow, but should not look like a separate application.

## Decisions

- Title metadata should be quiet text/status, not a row of prominent pills.
- Timers are optional training tools. Make them unobtrusive, hideable, pausable, and restartable.
- Prompt is first-class and visible by default. It can be hidden/restored, but should not be treated as secondary.
- Plan and Scratchpad are interview/scenario-only tools.
- In interview/scenario modes, the left pane should be prompt-only. Put Interviewer, Plan, Scratchpad, and Notes in the right support pane.
- Workspace Diff and Local Folder should not be visible by default in the practice flow. Keep them as overflow/developer escape hatches if retained.
- Active coding layouts should use independent pane scrolling. Avoid a single document scroll that moves prompt, editor, tests, and interviewer together.
- Scenario test output should match the standard runner's information architecture: passing rows collapsed, failing rows expanded, Input / Expected / Actual foregrounded, traceback/details secondary and collapsible.
- Syntax/import/run-level errors must be shown directly in the test pane. Do not reduce them to "not run" rows.
- Python execution in these app surfaces should be browser-worker/Pyodide. The daemon can persist content and scenario files, but local `python -m unittest` subprocesses are not the app runtime for candidate code.

## Implementation Plan

1. Stabilize scenario test reporting.
   - Show run-level Python errors when Pyodide cannot compile or start tests.
   - Parse actual values from common `assertEqual` failures when available.
   - Keep full traceback/details available but secondary.

2. Rework Ramp/interview workspace structure.
   - Left pane: prompt only, independently scrollable.
   - Center: multi-file editor plus tests/results dock.
   - Right pane: tabs for Interviewer, Plan, Scratchpad, Notes.
   - Remove default Workspace Diff and Local Folder rows from the main visible surface.

3. Harmonize test/output docks.
   - Share visual treatment between standard problem output and scenario tests.
   - Keep passed cases collapsed and failed cases expanded.
   - Ensure test panes resize/collapse/restore consistently.

4. Calm header metadata and timers.
   - Replace prominent metadata pills with quiet metadata.
   - Move timer controls into an unobtrusive status/control area.
   - Support hiding timer display without losing pause/restart capability.

5. Verify in the native macOS app.
   - Build and package from `next/`.
   - Launch the exact worktree bundle.
   - Verify Ramp Onsite with current-buffer Pyodide execution, syntax errors, assertion failures, collapsed passing tests, and actual-vs-expected rows.

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

1. Stabilize scenario test reporting. Done for Ramp Onsite.
   - Run-level Python errors are shown when Pyodide cannot compile or start tests.
   - Common `assertEqual` failures foreground Input / Expected / Actual.
   - Full traceback/details remain available but secondary.

2. Rework Ramp/interview workspace structure. Done for the active Ramp workspace.
   - Left pane is prompt-only and can be collapsed/restored.
   - Center pane is the multi-file editor plus resizable/collapsible tests/results dock.
   - Right pane has tabs for Interviewer, Plan, Scratchpad, and Notes.
   - Workspace Diff and Local Folder are under Notes -> Developer tools, not in the default visible surface.

3. Harmonize test/output docks. Mostly done for Ramp Onsite.
   - Passed cases collapse by default and failed cases open.
   - The test pane can be resized, minimized, and restored.
   - Remaining follow-up: consider extracting shared output-dock primitives once another scenario needs the same behavior.

4. Calm header metadata and timers. Done for the active Ramp workspace.
   - Timer is a quiet control group.
   - Timer display can be hidden, paused/resumed, and restarted.
   - Pacing strip is visually de-emphasized.

5. Verify in the native macOS app.
   - Build and package from `next/`.
   - Launch the exact worktree bundle.
   - Verify Ramp Onsite with current-buffer Pyodide execution, syntax errors, assertion failures, collapsed passing tests, and actual-vs-expected rows.

# DSA Coach

DSA Coach is a local-first, offline-capable course for practicing data structures, algorithms, and practical programming. It is a standalone React app with original lessons, quizzes, and runnable Python problems executed entirely in the browser via Pyodide — no server, no account, no network round-trips after the first load.

The project is built for serious self-study: read a lesson, work through guided problems, run Python locally in the editor, check your solution against visible *and* hidden tests, take quizzes, and export your progress as JSON.

![Problem workspace](ui-snapshots/problem-guided.png)

## Why it exists

Most practice tools are either online judges that hide the test cases, or static problem lists with no feedback loop. DSA Coach closes the loop locally:

- **Every reference solution is verified.** A build-time script runs all 243 reference solutions (plus 24 multi-part extensions) against their full visible + hidden test suites. A problem cannot ship if its own reference answer fails.
- **Hidden tests catch sloppy solutions.** Visible examples teach the contract; hidden tests probe the edge cases a rushed implementation gets wrong (off-by-one boundaries, mutation of inputs, tie-break order, parity, empty/degenerate inputs).
- **Two practice tracks.** A structured 13-module course for fundamentals, and curated problem sets for interview-style and Advent-of-Code-style practice — including multi-part problems where Part 2 extends your Part 1 design, mirroring how real interviews escalate.

## Features

- **13 course modules** covering foundations, arrays, sliding windows, hashing, linked lists, stacks and queues, trees and graphs, heaps, greedy, binary search, backtracking, dynamic programming, and mixed review.
- **70 guided problems and 140 runnable bonus drills**, 12 quizzes with answer explanations.
- **4 problem sets (33 problems):** a practical generalist-interview set and three Advent-of-Code-style "years" (parse messy input → answer Part 1 → extend for Part 2). 24 of these carry a runnable Part 2.
- **In-browser Python** through Pyodide in a Web Worker, with a 45-second execution timeout and separate run / submit flows.
- **Type-aware autocomplete:** a static stdlib completion source plus a Jedi-in-Pyodide language service running in its own worker, so `cnt = Counter(); cnt.` proposes real `Counter` methods.
- **Problem workspace** with prompt, constraints, examples, CodeMirror editor, visible/hidden test results, stdout, errors, a scratchpad, notes, submission history, progressive hints, solutions, and an interview-discipline checklist on the problem sets.
- **IndexedDB persistence** for progress, notes, submissions, settings, spaced-review state, and per-problem (and per-part) workspace code.
- **JSON export/import** to move local progress between browsers.
- **Offline PWA** via a production service worker — the full app shell works without a network.
- **OS-respecting dark mode**, responsive down to mobile, and an accessible component layer audited with axe.

## Practice tracks

**Modules** — the structured course. Each chapter has a long-form lesson (learning goals, pattern-recognition signals, mental models, worked examples, an implementation checklist, common mistakes, and complexity notes), guided problems, runnable bonus drills, and a quiz.

**Problem sets** — focused, calibrated practice that sits alongside the course:

| Set | Shape |
| --- | --- |
| Practical Interview Problems | 12 language-agnostic problems sized to a generalist coding interview; 3 extend into a Part 2 |
| Year One / Two / Three | 7 Advent-of-Code-style problems each: parse a messy text blob, compute Part 1, then a Part 2 that builds on it |

![Dashboard](ui-snapshots/dashboard.png)

## Quick Start

Prerequisite: [Bun](https://bun.sh/) 1.3.2 or newer.

```bash
bun install
bun run dev
```

Then open the URL printed by Vite, usually `http://127.0.0.1:5173`.

```bash
bun run build      # type-check then production build
bun run preview    # serve the production build locally
```

## Scripts

```bash
bun run dev                # Start Vite locally
bun run build              # Type-check and build
bun run preview            # Serve the production build locally
bun run test               # Unit tests (Vitest)
bun run test:e2e           # Playwright end-to-end tests
bun run test:a11y          # Playwright axe accessibility checks
bun run test:pwa           # Production offline / PWA checks
bun run validate:content   # Validate course and problem metadata against the schema
bun run verify:references  # Run every reference solution against its tests
```

## Project Structure

```text
src/components/   React screens and the problem workspace
src/content/      Course metadata, lessons, problems, quizzes, problem sets
src/runner/       Pyodide test worker, Jedi intellisense worker, result comparison
src/storage/      Dexie / IndexedDB persistence
src/hooks/        Course store + React context
scripts/          Content validation and reference verification
tests/            Unit, E2E, accessibility, and PWA tests
ui-snapshots/     Reference screenshots
```

The interesting engineering lives in three places: the Pyodide-in-Worker runner with a normalized output comparator, the Zod-validated content pipeline whose every reference solution is executed and checked in CI-style gates, and the Jedi-backed completion service that brings IDE-grade Python autocomplete into a fully offline browser app.

## Content

All course content is original. Public topic coverage inspires the scope; no locked or paid lesson text, prompts, solutions, or templates are copied. The Advent-of-Code-style sets are original puzzles written in the same parse-then-extend shape — they are not copies of any published puzzle.

Each problem ships with a prompt, constraints, worked examples, starter code, a verified reference solution, an alternate solution write-up, visible and hidden tests, progressive hints, a walkthrough, complexity notes, and follow-up ideas.

## Local Data

DSA Coach stores everything in browser IndexedDB — lesson/quiz/problem progress, submissions and run history, notes and scratchpad state, starred problems, spaced-review scheduling, and workspace layout. There is no account system and no cloud sync; use the built-in export/import controls to back up or move progress.

## Quality Gates

Before publishing a substantial content or UI change, the full gate is:

```bash
bun run validate:content
bun run verify:references
bun run test
bun run build
bun run test:e2e
bun run test:a11y
bun run test:pwa
```

`verify:references` is the load-bearing one: it executes every reference solution — including each multi-part Part 2 — against its complete test suite, so a regression in the content pipeline fails the build rather than reaching a learner.

## License

Released under the [MIT License](LICENSE).

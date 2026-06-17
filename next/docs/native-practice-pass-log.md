# Native Practice Pass Log

Goal: run 10 sequential native-app practice passes as a human prep/drill user would: launch the macOS app, work through Ramp and other involved problems, make mistakes, run tests, exercise the coach, evaluate coach quality, capture UX findings, improve the prompt/app, and commit useful changes.

Screenshots live in `next/docs/native-practice-pass-screenshots/`.

## Pass Status

| Pass | Surface | Focus | Screenshot | Result |
| --- | --- | --- | --- | --- |
| 1 | Ramp Onsite: Hotel Reservation Service | Visible-test debugging, coach loop, final Pyodide pass | [`pass-01-ramp-onsite-initial.png`](native-practice-pass-screenshots/pass-01-ramp-onsite-initial.png), [`pass-01-ramp-onsite-final.png`](native-practice-pass-screenshots/pass-01-ramp-onsite-final.png), [`pass-01-timer-reset-verification.png`](native-practice-pass-screenshots/pass-01-timer-reset-verification.png) | Completed: 5/5 visible tests passed |
| 2 | Ramp AI Backend Drills: Transaction Sync Client | Scenario start, coach loop, Pyodide visible/hidden tests, debrief path | [`pass-02-sync-start.png`](native-practice-pass-screenshots/pass-02-sync-start.png), [`pass-02-sync-initial-failure.png`](native-practice-pass-screenshots/pass-02-sync-initial-failure.png), [`pass-02-sync-visible-pass.png`](native-practice-pass-screenshots/pass-02-sync-visible-pass.png), [`pass-02-sync-hidden-pass-judging-stuck.png`](native-practice-pass-screenshots/pass-02-sync-hidden-pass-judging-stuck.png), [`pass-02-sync-rebuilt-default-file.png`](native-practice-pass-screenshots/pass-02-sync-rebuilt-default-file.png) | Completed: 3/3 visible and 3/3 hidden tests passed |
| 3 | Pending | Pending | Pending | Pending |
| 4 | Pending | Pending | Pending | Pending |
| 5 | Pending | Pending | Pending | Pending |
| 6 | Pending | Pending | Pending | Pending |
| 7 | Pending | Pending | Pending | Pending |
| 8 | Pending | Pending | Pending | Pending |
| 9 | Pending | Pending | Pending | Pending |
| 10 | Pending | Pending | Pending | Pending |

## Pass 1: Ramp Onsite Hotel Reservation Service

Scenario: resumed an existing Hotel Reservation Service attempt in the native macOS app. The starting visible run showed `2/5` failed with command label `Pyodide unittest`, which confirmed this surface is using the in-app runtime instead of local Python for the fresh run history.

Exercise path:

- Started from the visible failures. The failed rows foregrounded Input / Expected Output / Actual Output, which made the overlap and cancellation bugs easy to reason about without expanding tracebacks.
- Edited `src/reservations.py` in the in-app editor with an intentional intermediate mistake: fixed overlap/cancel/availability, but left `GUEST_RESERVATIONS` returning creation order.
- Ran visible tests and got a fresh `4/5` Pyodide result. The remaining failure was clear: expected `res_2,res_1`, actual `res_1,res_2`.
- Asked the interviewer for the invariant without writing the code. The coach answered with the right contract: sort active guest reservations by `(check_in, creation_order)`, and suggested a same-check-in pressure test.
- Answered the interviewer prompt aloud in the right pane, then fixed the implementation by using reservation insertion order as the creation-order tie-breaker.
- Re-ran visible tests and got `5/5 passed / 1115 ms` with `Pyodide unittest`.

UX notes:

- Good: the editor save state, run lockout, Pyodide command label, and expected-vs-actual result presentation all worked in the native app.
- Good: the coach gave direction instead of code, and the follow-up question about the creation-order state model was useful.
- Issue: resuming an old attempt showed a `7:43:xx` elapsed timer and “0 minutes remaining. Review is the active pacing band.” This is too loud and stale for a training tool. Old resumed attempts should start paused or otherwise de-emphasize the stale timer state.
- Issue: the prompt can briefly show `Loading prompt...` while the rest of the workspace is present. That is acceptable for a moment, but it is visually alarming if captured in a screenshot or if the user starts immediately.
- Issue: the support-pane transcript is useful, but long coach responses become cramped in the narrow right rail. Worth watching in later passes before changing it.

App improvement from this pass: stale active scenario attempts now reopen as `0:00 Paused` with “Resume” and “Restart” controls, and the time-check copy says to resume or restart when beginning. Verified in the rebuilt native app after packaging; see `pass-01-timer-reset-verification.png`.

## Pass 2: Ramp AI Backend Drills Transaction Sync Client

Scenario: started the Transaction Sync Client drill in the native macOS app and worked through it as a candidate using the in-app editor, coach, visible tests, hidden tests, and debrief studio.

Exercise path:

- Started the scenario from the Ramp AI Backend Drills set. The pre-session screen was usable, but the center area felt sparse before pressing “Start session.”
- The scenario initially opened on `src/__init__.py`, which is a poor default for a coding drill because the actual implementation is `src/sync.py`.
- Switched to `src/sync.py` and ran visible tests. The first run showed `1/3 failed / 5602 ms` with `Pyodide unittest`: single-page import passed; pagination and duplicate-id upsert failed.
- Asked the coach what to clarify before coding. The coach correctly focused on the meaning of `inserted`, the final stored rows, the cursor invariant, and the fact that the current result still looked like a one-page implementation.
- Opened `tests/test_sync.py` in the app to inspect assertions. The expected contract was clear: walk all pages, count newly stored unique ids, update duplicates in place, and leave `store.cursor` as the next page to fetch.
- Implemented a cursor loop and retry helper in the in-app editor. Chose `max_retries=2` to mean two retries after the first attempt.
- Re-ran visible tests and got `3/3 passed / 915 ms` with `Pyodide unittest`.
- Ended the session, added the final explanation, and ran hidden tests. Hidden submit passed `3/3` with `Pyodide unittest`, covering retryable errors, non-retryable errors, and resume-from-existing-cursor behavior.

UX notes:

- Good: current-buffer execution worked. The edited in-app `src/sync.py` buffer drove both visible and hidden Pyodide runs.
- Good: the coach response was appropriately interviewer-like and identified the real blocker instead of writing the code.
- Good: the debrief studio stayed gated until the session ended, and hidden tests were available only after ending.
- Issue: the default active file should never be a blank `src/__init__.py` when a meaningful `src/*.py` implementation file exists.
- Issue: after clicking “Generate debrief,” the screen stayed on `Judging attempt...` with disabled controls long enough to feel stuck, though it eventually returned a report. That needs either a shorter timeout/fallback or a visible retry/cancel affordance.
- Issue: the generated report said `HIRE` while every rubric row displayed `1 /5`. The numeric scale needs to be explicit in the judge prompt so scores align with the overall recommendation.
- Issue: when the editor is scrolled to the bottom, the accessibility value can appear visually empty at the top of the field even though line nodes still exist. This is probably a CodeMirror/accessibility artifact, but it makes state inspection noisier.

App improvements from this pass: scenario file selection now prefers known main implementation files and non-`__init__.py` Python files before falling back to `__init__.py` or the first file. Judge generation now has a bounded timeout so the debrief can fall back instead of leaving the UI on `Judging attempt...` for minutes. The judge prompt now defines the 1-5 score scale and requires score consistency with the overall decision.

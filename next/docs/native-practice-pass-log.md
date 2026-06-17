# Native Practice Pass Log

Goal: run 10 sequential native-app practice passes as a human prep/drill user would: launch the macOS app, work through Ramp and other involved problems, make mistakes, run tests, exercise the coach, evaluate coach quality, capture UX findings, improve the prompt/app, and commit useful changes.

Screenshots live in `next/docs/native-practice-pass-screenshots/`.

## Pass Status

| Pass | Surface | Focus | Screenshot | Result |
| --- | --- | --- | --- | --- |
| 1 | Ramp Onsite: Hotel Reservation Service | Visible-test debugging, coach loop, final Pyodide pass | [`pass-01-ramp-onsite-initial.png`](native-practice-pass-screenshots/pass-01-ramp-onsite-initial.png), [`pass-01-ramp-onsite-final.png`](native-practice-pass-screenshots/pass-01-ramp-onsite-final.png), [`pass-01-timer-reset-verification.png`](native-practice-pass-screenshots/pass-01-timer-reset-verification.png) | Completed: 5/5 visible tests passed |
| 2 | Ramp AI Backend Drills: Transaction Sync Client | Scenario start, coach loop, Pyodide visible/hidden tests, debrief path | [`pass-02-sync-start.png`](native-practice-pass-screenshots/pass-02-sync-start.png), [`pass-02-sync-initial-failure.png`](native-practice-pass-screenshots/pass-02-sync-initial-failure.png), [`pass-02-sync-visible-pass.png`](native-practice-pass-screenshots/pass-02-sync-visible-pass.png), [`pass-02-sync-hidden-pass-judging-stuck.png`](native-practice-pass-screenshots/pass-02-sync-hidden-pass-judging-stuck.png), [`pass-02-sync-rebuilt-default-file.png`](native-practice-pass-screenshots/pass-02-sync-rebuilt-default-file.png) | Completed: 3/3 visible and 3/3 hidden tests passed |
| 3 | Ramp AI Backend Drills: Ledger Reconciliation | Coach pressure-test, stale-buffer recovery, Pyodide visible/hidden tests | [`pass-03-ledger-start.png`](native-practice-pass-screenshots/pass-03-ledger-start.png), [`pass-03-ledger-initial-test-run.png`](native-practice-pass-screenshots/pass-03-ledger-initial-test-run.png), [`pass-03-ledger-coach-response.png`](native-practice-pass-screenshots/pass-03-ledger-coach-response.png), [`pass-03-ledger-visible-rerun.png`](native-practice-pass-screenshots/pass-03-ledger-visible-rerun.png), [`pass-03-ledger-hidden-pass.png`](native-practice-pass-screenshots/pass-03-ledger-hidden-pass.png) | Completed: 3/3 visible and 3/3 hidden tests passed |
| 4 | Ramp AI Backend Drills: Receipt Matcher | Explicit-id conflicts, conservative inferred matching, coach loop, Pyodide visible/hidden tests | [`pass-04-receipt-start.png`](native-practice-pass-screenshots/pass-04-receipt-start.png), [`pass-04-receipt-initial-failure.png`](native-practice-pass-screenshots/pass-04-receipt-initial-failure.png), [`pass-04-receipt-visible-after-coach-fix.png`](native-practice-pass-screenshots/pass-04-receipt-visible-after-coach-fix.png), [`pass-04-receipt-hidden-pass.png`](native-practice-pass-screenshots/pass-04-receipt-hidden-pass.png) | Completed: 3/3 visible and 4/4 hidden tests passed |
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

## Pass 3: Ramp AI Backend Drills Ledger Reconciliation

Scenario: resumed the Ledger Reconciliation drill in the native macOS app and worked through it with visible tests, coach pressure testing, hidden tests, and the debrief gate.

Exercise path:

- Reopened the scenario after the previous build. The screen correctly opened `src/reconciliation.py`, kept the timer paused at `0:00`, and showed the previous `Pyodide unittest` run state instead of a local Python command.
- Ran visible tests from the native app. The starting implementation showed `1/3 failed / 867 ms`; exact external-id matching passed, but missing-external-id inference and ambiguity reporting failed.
- Implemented a first candidate solution in the in-app editor: exact-id pass first, then amount/date/merchant-token inference, and ambiguity when a single internal row had multiple bank candidates.
- Re-ran visible tests and got `3/3 passed / 839 ms` with `Pyodide unittest`.
- Asked the coach to pressure-test the one-to-one and ambiguity logic before submit. The coach found a real gap: two internal rows can both have the same single bank candidate, and greedily consuming that bank row is input-order dependent.
- The second edit attempt exposed a stale-buffer/tooling issue: macOS paste updated the editor once, then failed to replace the buffer on the next attempt. I recovered by saving the corrected graph-based version through the app scenario file API, refreshing the native webview, and reopening the scenario so the visible editor reloaded the saved file.
- Re-ran visible tests in the native app after reopening. The result was `3/3 passed / 879 ms` with `Pyodide unittest`.
- Ended the session, opened Debrief Studio, and ran hidden tests. Hidden submit passed `3/3 / 901 ms` with `Pyodide unittest`.

UX notes:

- Good: the coach identified a meaningful invariant not covered by the current tests: inferred matching should only auto-match clear degree-1-on-both-sides edges after exact-id matches are removed.
- Good: native scenario buttons are exposed to the accessibility tree with useful titles, so AXPress can drive the app when coordinate clicking fails.
- Good: ending the session cleanly revealed Debrief Studio and kept hidden tests gated until then.
- Issue: Computer Use app-state and click calls timed out repeatedly during this pass. The native app stayed responsive, but the Computer Use bridge became unusable for direct inspection/clicking.
- Issue: CodeMirror text entry through macOS AX is unreliable. Direct value-setting did not update the editor; paste-based input worked once and then left the visible buffer stale. This matters because stale buffers can overwrite daemon-saved files when tests flush the active editor.
- Issue: coordinate-based macOS fallback is error-prone in a desktop with overlapping Codex and native-app windows. AXPress by titled control was much more reliable than raw mouse coordinates.

App/content improvement from this pass: Ledger Reconciliation hidden tests now include the coach-discovered shared-single-candidate case so future solutions cannot greedily match one of two internal rows to the same sole bank candidate without reporting ambiguity.

## Pass 4: Ramp AI Backend Drills Receipt Matcher

Scenario: started the Receipt Matcher drill in the native macOS app and worked through the visible tests, coach pressure test, and hidden/debrief flow.

Exercise path:

- Started a fresh Receipt Matcher session from Ramp AI Backend Drills. The prompt and pre-session panel were clear, and the session loaded `src/receipts.py` with visible tests at `0/3 not run`.
- Ran starter visible tests. The first run showed `1/3 failed / 849 ms` with `Pyodide unittest`; explicit transaction-id attachment passed, while inferred matching and ambiguity routing failed.
- Implemented explicit-id-first matching, simple vendor token normalization, two-day date windows, one-to-one candidate graph matching, review for ambiguous candidates, and unmatched for no candidates.
- Because Computer Use and CodeMirror text injection remained unreliable, saved the implementation through the app scenario file API, then navigated out and back into the scenario to reload the saved buffer before running tests.
- Re-ran visible tests and got `3/3 passed / 867 ms` with `Pyodide unittest`.
- Asked the coach to pressure-test weak normalization and one-to-one behavior. The coach found a real issue: if a receipt has a valid `transaction_id` that is already consumed by another receipt, it should not fall through to heuristic matching and attach to a different transaction.
- Fixed the duplicate-explicit-id conflict by sending that receipt to review, reloaded the scenario again, and re-ran visible tests. The result stayed `3/3 passed / 868 ms`.
- Ended the session and ran hidden tests. Hidden submit passed `4/4 / 875 ms` with `Pyodide unittest`.

UX notes:

- Good: the visible tests’ Expected/Actual/Details layout made the missing inferred behavior obvious.
- Good: the coach was useful again; it identified an over-attachment risk not covered by the existing hidden tests.
- Good: hidden tests remained gated until session end and ran through Pyodide.
- Issue: persistent Computer Use timeouts mean the app itself can be responsive while the preferred verification tool is unusable. AXPress by named control remains workable, but this is slower and less representative than direct Computer Use.
- Issue: after reopening from an API save, stale visible results remain in the test pane until the next run. This is technically accurate history, but visually it can make it look like the reloaded editor still has failing code until the user notices the old timestamp/result.

App/content improvement from this pass: Receipt Matcher hidden tests now include the duplicate-explicit-transaction-id conflict the coach found, ensuring future solutions cannot fall back from a consumed explicit transaction id to heuristic attachment elsewhere.

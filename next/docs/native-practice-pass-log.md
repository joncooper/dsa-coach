# Native Practice Pass Log

Goal: run 10 sequential native-app practice passes as a human prep/drill user would: launch the macOS app, work through Ramp and other involved problems, make mistakes, run tests, exercise the coach, evaluate coach quality, capture UX findings, improve the prompt/app, and commit useful changes.

Screenshots live in `next/docs/native-practice-pass-screenshots/`.

## Pass Status

| Pass | Surface | Focus | Screenshot | Result |
| --- | --- | --- | --- | --- |
| 1 | Ramp Onsite: Hotel Reservation Service | Visible-test debugging, coach loop, final Pyodide pass | [`pass-01-ramp-onsite-initial.png`](native-practice-pass-screenshots/pass-01-ramp-onsite-initial.png), [`pass-01-ramp-onsite-final.png`](native-practice-pass-screenshots/pass-01-ramp-onsite-final.png), [`pass-01-timer-reset-verification.png`](native-practice-pass-screenshots/pass-01-timer-reset-verification.png) | Completed: 5/5 visible tests passed |
| 2 | Pending | Pending | Pending | Pending |
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

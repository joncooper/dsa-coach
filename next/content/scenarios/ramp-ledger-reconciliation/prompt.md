You are joining a small backend service that reconciles Ramp's internal ledger against a bank feed.

The current code already handles the easy case: when both sides carry the same external processor id, it pairs them and reports the rest as unmatched.

The interviewer now asks you to make the MVP useful when that id is missing.

You have two feeds:

- Internal ledger entries: what Ramp thinks happened.
- Bank entries: what the bank says posted.

For this exercise, keep the matching one-to-one. A row on either side can be used in at most one match.

Extend the reconciler so it can also match a ledger row to a bank row when:

- The amounts are exactly equal in cents.
- The bank posted date is within `day_tolerance` calendar days of the internal booked date.
- The merchant/description are plausibly the same merchant after simple normalization.

If a row has exactly one clear candidate, match it. If there are multiple plausible candidates and the MVP cannot choose safely, leave the involved rows unmatched and include an ambiguity record rather than guessing.

The output shape is already defined by `MatchReport`.

Your goal is not to build a production reconciliation engine. The goal is to read the existing service, extend it carefully, add focused tests if helpful, and be ready to explain your assumptions and tradeoffs.

Useful questions to think through as you work:

- What counts as "plausibly the same merchant" for a deterministic MVP?
- How will you prevent one bank row from satisfying two internal rows?
- What should happen when exact-id matches and inferred matches both exist?
- How would you explain the remaining production risks?

You are looking at a small backend sync job that imports card transactions from a partner API into Ramp's local store.

The current implementation was written for the first demo. It fetches one page and writes those transactions. That is not enough for production traffic.

Extend it so a sync can:

- Walk every page until the API says there is no `next_cursor`.
- Upsert by transaction id so duplicate records do not create duplicate stored transactions.
- Retry retryable API errors a small number of times before giving up.
- Keep the store's cursor/high-water mark at the next page to fetch after a successful run.

The provided `FakeTransactionApi` and `TransactionStore` are intentionally small. Treat them like a test double for a real integration.

Be careful about partial progress. If a later page fails after retries, it is acceptable for already-fetched transactions to remain written, but the cursor should not pretend the failed page was completed.

The interviewer is looking for a practical MVP and clear ownership of the sync invariant, not a production-grade scheduler.

Useful questions to think through:

- Which errors are retryable?
- When exactly should the cursor advance?
- What happens if the same transaction appears on two pages?
- What would you add in production that you are intentionally not building here?

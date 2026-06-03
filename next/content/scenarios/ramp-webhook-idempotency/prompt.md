You are working on a payment webhook handler.

The handler receives events from a card/payment processor. In a real system, webhooks can be delivered more than once, and they can arrive out of order. The current implementation works for a clean happy path, but duplicate or stale events can corrupt payment state.

Extend the handler so it behaves like a small, deterministic state machine.

For this exercise, each event is a dictionary with:

- `id`: unique event id from the processor.
- `type`: one of `payment.created`, `payment.authorized`, `payment.captured`, `payment.refunded`, `payment.failed`.
- `payment_id`: the payment being updated.
- `amount_cents`: amount associated with the event.
- `created_at`: ISO timestamp string.

Rules for the MVP:

- Applying the same event id more than once must not change state after the first application.
- A later lifecycle state should not be overwritten by an older lifecycle state.
- `captured`, `refunded`, and `failed` are terminal for this exercise.
- Unknown event types should be ignored safely.
- Keep enough audit information to explain which events were applied or ignored.

You do not need to build persistence, authentication, signature validation, or a queue. Focus on making the in-memory handler correct and explainable.

Useful questions to think through:

- What is the state transition invariant?
- Where should idempotency live?
- What should happen if the first event you see for a payment is not `created`?
- Which behavior would you make more explicit in production?

You are extending a receipt attachment service.

Right now the service only attaches a receipt when the receipt explicitly names a transaction id. That works for some uploads, but many receipts arrive from email or OCR without a reliable transaction id.

The interviewer asks you to build a deterministic MVP that can attach obvious receipts and route unclear ones to review.

You have:

- Card transactions with id, amount in cents, posted date, merchant, and cardholder id.
- Receipts with id, amount in cents, purchase date, vendor text, cardholder id, and an optional transaction id.

Extend `match_receipts` so each receipt ends in exactly one bucket:

- `attached`: a receipt was safely attached to one transaction.
- `review`: there are multiple plausible transactions, or the match is too weak to trust.
- `unmatched`: there is no plausible transaction.

Matching rules for the MVP:

- If `transaction_id` points to an existing transaction, attach it directly.
- Otherwise, require same cardholder, exact amount, purchase/post date within two calendar days, and simple vendor/merchant normalization.
- Do not attach two receipts to the same transaction.
- Do not guess when two transactions both look plausible.

The production version would probably use better merchant normalization and confidence scoring. Do not build that whole system. Build the small, deterministic extension and be ready to defend what it does and does not handle.

Useful questions to think through:

- What is a safe match versus a review case?
- Which fields are hard requirements?
- How will you keep the result explainable to an ops teammate?
- What tests prove you did not silently over-attach receipts?

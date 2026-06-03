from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Transaction:
    id: str
    amount_cents: int
    posted_date: str
    merchant: str
    cardholder_id: str


@dataclass(frozen=True)
class Receipt:
    id: str
    amount_cents: int
    purchase_date: str
    vendor: str
    cardholder_id: str
    transaction_id: str | None = None


@dataclass
class MatchResult:
    attached: list[tuple[str, str]] = field(default_factory=list)
    review: list[dict[str, object]] = field(default_factory=list)
    unmatched: list[str] = field(default_factory=list)


def match_receipts(transactions: list[Transaction], receipts: list[Receipt]) -> MatchResult:
    """Attach receipts to transactions where the relationship is safe."""
    by_id = {transaction.id: transaction for transaction in transactions}
    used_transactions: set[str] = set()
    attached: list[tuple[str, str]] = []
    unmatched: list[str] = []

    for receipt in receipts:
        if receipt.transaction_id and receipt.transaction_id in by_id:
            transaction = by_id[receipt.transaction_id]
            if transaction.id not in used_transactions:
                attached.append((receipt.id, transaction.id))
                used_transactions.add(transaction.id)
                continue
        unmatched.append(receipt.id)

    return MatchResult(
        attached=sorted(attached),
        review=[],
        unmatched=sorted(unmatched),
    )

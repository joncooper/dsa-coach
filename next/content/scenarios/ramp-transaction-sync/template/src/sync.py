from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Transaction:
    id: str
    amount_cents: int
    merchant: str
    posted_at: str


class ApiError(Exception):
    def __init__(self, status_code: int, message: str = ""):
        super().__init__(message or f"API failed with {status_code}")
        self.status_code = status_code


class FakeTransactionApi:
    def __init__(self, pages: dict[str | None, dict], failures: dict[str | None, list[int]] | None = None):
        self.pages = pages
        self.failures = failures or {}
        self.calls: list[str | None] = []

    def fetch_page(self, cursor: str | None) -> dict:
        self.calls.append(cursor)
        failures = self.failures.get(cursor)
        if failures:
            status_code = failures.pop(0)
            raise ApiError(status_code)
        return self.pages[cursor]


class TransactionStore:
    def __init__(self):
        self.transactions: dict[str, Transaction] = {}
        self.cursor: str | None = None

    def upsert_many(self, transactions: list[Transaction]) -> int:
        before = len(self.transactions)
        for transaction in transactions:
            self.transactions[transaction.id] = transaction
        return len(self.transactions) - before


def parse_transaction(raw: dict) -> Transaction:
    return Transaction(
        id=raw["id"],
        amount_cents=raw["amount_cents"],
        merchant=raw["merchant"],
        posted_at=raw["posted_at"],
    )


def sync_transactions(api: FakeTransactionApi, store: TransactionStore, max_retries: int = 2) -> int:
    """Fetch transactions from the API and return the number of newly stored ids."""
    page = api.fetch_page(store.cursor)
    transactions = [parse_transaction(raw) for raw in page["transactions"]]
    inserted = store.upsert_many(transactions)
    store.cursor = page.get("next_cursor")
    return inserted

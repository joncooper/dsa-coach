from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date


@dataclass(frozen=True)
class InternalEntry:
    id: str
    amount_cents: int
    booked_date: str
    merchant: str
    external_id: str | None = None


@dataclass(frozen=True)
class BankEntry:
    id: str
    amount_cents: int
    posted_date: str
    description: str
    external_id: str | None = None


@dataclass
class MatchReport:
    matched: list[tuple[str, str]] = field(default_factory=list)
    unmatched_internal: list[str] = field(default_factory=list)
    unmatched_external: list[str] = field(default_factory=list)
    ambiguous: list[dict[str, object]] = field(default_factory=list)


def parse_date(value: str) -> date:
    return date.fromisoformat(value)


def reconcile(
    internal_entries: list[InternalEntry],
    bank_entries: list[BankEntry],
    day_tolerance: int = 2,
) -> MatchReport:
    """Return a one-to-one reconciliation report for internal and bank rows."""
    matched: list[tuple[str, str]] = []
    used_internal: set[str] = set()
    used_external: set[str] = set()

    bank_by_external_id = {
        bank.external_id: bank
        for bank in bank_entries
        if bank.external_id is not None
    }

    for internal in internal_entries:
        if internal.external_id is None:
            continue

        bank = bank_by_external_id.get(internal.external_id)
        if bank is None or bank.id in used_external:
            continue

        matched.append((internal.id, bank.id))
        used_internal.add(internal.id)
        used_external.add(bank.id)

    return MatchReport(
        matched=sorted(matched),
        unmatched_internal=sorted(
            internal.id for internal in internal_entries if internal.id not in used_internal
        ),
        unmatched_external=sorted(
            bank.id for bank in bank_entries if bank.id not in used_external
        ),
        ambiguous=[],
    )

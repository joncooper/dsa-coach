from __future__ import annotations

from dataclasses import dataclass, field


STATUS_RANK = {
    "created": 1,
    "authorized": 2,
    "captured": 3,
    "refunded": 4,
    "failed": 4,
}


@dataclass
class Payment:
    id: str
    status: str = "created"
    amount_cents: int = 0
    captured_cents: int = 0
    refunded_cents: int = 0
    handled_event_ids: set[str] = field(default_factory=set)
    audit_log: list[str] = field(default_factory=list)


class PaymentStore:
    def __init__(self):
        self.payments: dict[str, Payment] = {}

    def get_or_create(self, payment_id: str, amount_cents: int = 0) -> Payment:
        if payment_id not in self.payments:
            self.payments[payment_id] = Payment(id=payment_id, amount_cents=amount_cents)
        return self.payments[payment_id]


def handle_event(store: PaymentStore, event: dict) -> Payment | None:
    event_type = event.get("type", "")
    if not event_type.startswith("payment."):
        return None

    status = event_type.split(".", 1)[1]
    payment = store.get_or_create(event["payment_id"], event.get("amount_cents", 0))

    if status == "created":
        payment.status = "created"
        payment.amount_cents = event.get("amount_cents", payment.amount_cents)
    elif status == "authorized":
        payment.status = "authorized"
    elif status == "captured":
        payment.status = "captured"
        payment.captured_cents += event.get("amount_cents", 0)
    elif status == "refunded":
        payment.status = "refunded"
        payment.refunded_cents += event.get("amount_cents", 0)
    elif status == "failed":
        payment.status = "failed"

    payment.handled_event_ids.add(event["id"])
    payment.audit_log.append(f"applied:{event['id']}:{event_type}")
    return payment

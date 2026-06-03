import unittest

from src.payments import PaymentStore, handle_event


def event(event_id, event_type, payment_id="pay_1", amount=1000, created_at="2026-06-01T10:00:00"):
    return {
        "id": event_id,
        "type": event_type,
        "payment_id": payment_id,
        "amount_cents": amount,
        "created_at": created_at,
    }


class PaymentWebhookTests(unittest.TestCase):
    def test_happy_path_capture(self):
        store = PaymentStore()

        handle_event(store, event("evt_1", "payment.created", amount=1200))
        payment = handle_event(store, event("evt_2", "payment.captured", amount=1200))

        self.assertEqual(payment.status, "captured")
        self.assertEqual(payment.amount_cents, 1200)
        self.assertEqual(payment.captured_cents, 1200)

    def test_duplicate_capture_event_is_idempotent(self):
        store = PaymentStore()

        handle_event(store, event("evt_1", "payment.created", amount=900))
        handle_event(store, event("evt_2", "payment.captured", amount=900))
        handle_event(store, event("evt_2", "payment.captured", amount=900))

        payment = store.payments["pay_1"]
        self.assertEqual(payment.status, "captured")
        self.assertEqual(payment.captured_cents, 900)
        self.assertIn("evt_2", payment.handled_event_ids)

    def test_stale_created_event_does_not_rewind_captured_payment(self):
        store = PaymentStore()

        handle_event(store, event("evt_2", "payment.captured", amount=700, created_at="2026-06-01T10:05:00"))
        handle_event(store, event("evt_1", "payment.created", amount=700, created_at="2026-06-01T10:00:00"))

        payment = store.payments["pay_1"]
        self.assertEqual(payment.status, "captured")
        self.assertEqual(payment.captured_cents, 700)


if __name__ == "__main__":
    unittest.main()

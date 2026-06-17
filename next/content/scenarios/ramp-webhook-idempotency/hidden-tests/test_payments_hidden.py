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


class HiddenPaymentWebhookTests(unittest.TestCase):
    def test_terminal_failed_state_is_not_overwritten(self):
        store = PaymentStore()

        handle_event(store, event("evt_1", "payment.failed", amount=500))
        handle_event(store, event("evt_2", "payment.authorized", amount=500))

        self.assertEqual(store.payments["pay_1"].status, "failed")

    def test_unknown_event_is_ignored(self):
        store = PaymentStore()

        result = handle_event(store, event("evt_1", "payment.disputed", amount=500))

        self.assertIsNone(result)
        self.assertEqual(store.payments, {})

    def test_duplicate_refund_does_not_double_count(self):
        store = PaymentStore()

        handle_event(store, event("evt_1", "payment.captured", amount=1100))
        handle_event(store, event("evt_2", "payment.refunded", amount=300))
        handle_event(store, event("evt_2", "payment.refunded", amount=300))

        payment = store.payments["pay_1"]
        self.assertEqual(payment.status, "refunded")
        self.assertEqual(payment.refunded_cents, 300)

    def test_equal_rank_terminal_event_does_not_replace_first_terminal(self):
        store = PaymentStore()

        handle_event(store, event("evt_1", "payment.refunded", amount=300))
        handle_event(store, event("evt_2", "payment.failed", amount=300))

        payment = store.payments["pay_1"]
        self.assertEqual(payment.status, "refunded")
        self.assertEqual(payment.refunded_cents, 300)

    def test_event_id_is_global_not_per_payment(self):
        store = PaymentStore()

        handle_event(store, event("evt_1", "payment.created", payment_id="pay_1", amount=500))
        result = handle_event(store, event("evt_1", "payment.created", payment_id="pay_2", amount=700))

        self.assertIsNone(result)
        self.assertEqual(set(store.payments), {"pay_1"})


if __name__ == "__main__":
    unittest.main()

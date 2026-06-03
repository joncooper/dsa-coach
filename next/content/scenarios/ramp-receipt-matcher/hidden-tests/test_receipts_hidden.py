import unittest

from src.receipts import Receipt, Transaction, match_receipts


class HiddenReceiptMatcherTests(unittest.TestCase):
    def test_cardholder_must_match(self):
        result = match_receipts(
            [Transaction("txn_1", 1000, "2026-06-01", "Uber", "cardholder_1")],
            [Receipt("rcpt_1", 1000, "2026-06-01", "Uber", "cardholder_2")],
        )

        self.assertEqual(result.attached, [])
        self.assertEqual(result.review, [])
        self.assertEqual(result.unmatched, ["rcpt_1"])

    def test_transaction_can_only_be_used_once(self):
        result = match_receipts(
            [Transaction("txn_1", 1000, "2026-06-01", "Uber", "cardholder_1")],
            [
                Receipt("rcpt_1", 1000, "2026-06-01", "Uber", "cardholder_1", "txn_1"),
                Receipt("rcpt_2", 1000, "2026-06-01", "Uber", "cardholder_1"),
            ],
        )

        self.assertEqual(result.attached, [("rcpt_1", "txn_1")])
        remaining = set(result.unmatched)
        for review_item in result.review:
            remaining.add(review_item["receipt_id"])
        self.assertEqual(remaining, {"rcpt_2"})

    def test_two_day_window_and_simple_vendor_normalization(self):
        result = match_receipts(
            [Transaction("txn_1", 3499, "2026-06-03", "Whole Foods Market", "cardholder_1")],
            [Receipt("rcpt_1", 3499, "2026-06-01", "WHOLE-FOODS #123", "cardholder_1")],
        )

        self.assertEqual(result.attached, [("rcpt_1", "txn_1")])
        self.assertEqual(result.review, [])
        self.assertEqual(result.unmatched, [])

    def test_date_window_is_enforced(self):
        result = match_receipts(
            [Transaction("txn_1", 2000, "2026-06-10", "Hotel", "cardholder_1")],
            [Receipt("rcpt_1", 2000, "2026-06-01", "Hotel", "cardholder_1")],
        )

        self.assertEqual(result.attached, [])
        self.assertEqual(result.review, [])
        self.assertEqual(result.unmatched, ["rcpt_1"])


if __name__ == "__main__":
    unittest.main()

import unittest

from src.receipts import Receipt, Transaction, match_receipts


class ReceiptMatcherTests(unittest.TestCase):
    def test_explicit_transaction_id_still_attaches(self):
        result = match_receipts(
            [Transaction("txn_1", 2199, "2026-06-01", "Lyft", "cardholder_1")],
            [Receipt("rcpt_1", 2199, "2026-06-01", "Lyft", "cardholder_1", "txn_1")],
        )

        self.assertEqual(result.attached, [("rcpt_1", "txn_1")])
        self.assertEqual(result.review, [])
        self.assertEqual(result.unmatched, [])

    def test_obvious_receipt_without_transaction_id_attaches(self):
        result = match_receipts(
            [Transaction("txn_1", 8500, "2026-06-03", "Delta Airlines", "cardholder_1")],
            [Receipt("rcpt_1", 8500, "2026-06-01", "DELTA AIR LINES", "cardholder_1")],
        )

        self.assertEqual(result.attached, [("rcpt_1", "txn_1")])
        self.assertEqual(result.unmatched, [])

    def test_ambiguous_receipt_goes_to_review(self):
        result = match_receipts(
            [
                Transaction("txn_1", 1200, "2026-06-01", "Starbucks", "cardholder_1"),
                Transaction("txn_2", 1200, "2026-06-02", "Starbucks Store 90", "cardholder_1"),
            ],
            [Receipt("rcpt_1", 1200, "2026-06-01", "Starbucks", "cardholder_1")],
        )

        self.assertEqual(result.attached, [])
        self.assertEqual(result.unmatched, [])
        self.assertEqual(len(result.review), 1)
        self.assertEqual(result.review[0]["receipt_id"], "rcpt_1")
        self.assertEqual(set(result.review[0]["candidate_transaction_ids"]), {"txn_1", "txn_2"})


if __name__ == "__main__":
    unittest.main()

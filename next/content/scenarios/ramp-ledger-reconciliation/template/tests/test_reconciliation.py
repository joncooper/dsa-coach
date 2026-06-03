import unittest

from src.reconciliation import BankEntry, InternalEntry, reconcile


class ReconciliationTests(unittest.TestCase):
    def test_exact_external_id_match_still_works(self):
        report = reconcile(
            [
                InternalEntry("li_1", -1299, "2026-06-01", "AWS", "processor_1"),
                InternalEntry("li_2", -2400, "2026-06-01", "Notion"),
            ],
            [
                BankEntry("ba_1", -1299, "2026-06-02", "Amazon Web Services", "processor_1"),
                BankEntry("ba_2", -500, "2026-06-02", "Coffee Shop"),
            ],
        )

        self.assertEqual(report.matched, [("li_1", "ba_1")])
        self.assertEqual(report.unmatched_internal, ["li_2"])
        self.assertEqual(report.unmatched_external, ["ba_2"])
        self.assertEqual(report.ambiguous, [])

    def test_missing_external_id_can_match_by_amount_date_and_merchant(self):
        report = reconcile(
            [InternalEntry("li_1", -4250, "2026-06-01", "Github")],
            [BankEntry("ba_1", -4250, "2026-06-03", "GITHUB INC")],
        )

        self.assertEqual(report.matched, [("li_1", "ba_1")])
        self.assertEqual(report.unmatched_internal, [])
        self.assertEqual(report.unmatched_external, [])

    def test_ambiguous_candidates_are_reported_not_guessed(self):
        report = reconcile(
            [InternalEntry("li_1", -1000, "2026-06-01", "Figma")],
            [
                BankEntry("ba_1", -1000, "2026-06-01", "Figma"),
                BankEntry("ba_2", -1000, "2026-06-02", "Figma Inc"),
            ],
        )

        self.assertEqual(report.matched, [])
        self.assertEqual(report.unmatched_internal, ["li_1"])
        self.assertEqual(report.unmatched_external, ["ba_1", "ba_2"])
        self.assertEqual(len(report.ambiguous), 1)
        self.assertEqual(report.ambiguous[0]["internal_id"], "li_1")
        self.assertEqual(set(report.ambiguous[0]["candidate_external_ids"]), {"ba_1", "ba_2"})


if __name__ == "__main__":
    unittest.main()

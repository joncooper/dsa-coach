import unittest

from src.reconciliation import BankEntry, InternalEntry, reconcile


class HiddenReconciliationTests(unittest.TestCase):
    def test_exact_match_consumes_bank_row_before_inferred_matching(self):
        report = reconcile(
            [
                InternalEntry("li_1", -3000, "2026-06-01", "Slack", "processor_1"),
                InternalEntry("li_2", -3000, "2026-06-01", "Slack"),
            ],
            [BankEntry("ba_1", -3000, "2026-06-01", "SLACK TECHNOLOGIES", "processor_1")],
        )

        self.assertEqual(report.matched, [("li_1", "ba_1")])
        self.assertEqual(report.unmatched_internal, ["li_2"])
        self.assertEqual(report.unmatched_external, [])

    def test_day_tolerance_is_respected(self):
        report = reconcile(
            [InternalEntry("li_1", -800, "2026-06-01", "Zoom")],
            [
                BankEntry("ba_1", -800, "2026-06-04", "Zoom"),
                BankEntry("ba_2", -800, "2026-06-02", "Zoom Video"),
            ],
            day_tolerance=1,
        )

        self.assertEqual(report.matched, [("li_1", "ba_2")])
        self.assertEqual(report.unmatched_external, ["ba_1"])

    def test_exact_id_takes_precedence_over_inferred_match(self):
        report = reconcile(
            [InternalEntry("li_1", -1200, "2026-06-01", "Adobe", "processor_77")],
            [
                BankEntry("ba_wrong", -1200, "2026-06-01", "Adobe"),
                BankEntry("ba_exact", -1200, "2026-06-03", "Different Descriptor", "processor_77"),
            ],
        )

        self.assertEqual(report.matched, [("li_1", "ba_exact")])
        self.assertEqual(report.unmatched_external, ["ba_wrong"])

    def test_shared_single_candidate_is_ambiguous_not_greedy(self):
        report = reconcile(
            [
                InternalEntry("li_1", -1100, "2026-06-01", "Linear"),
                InternalEntry("li_2", -1100, "2026-06-01", "Linear"),
            ],
            [BankEntry("ba_1", -1100, "2026-06-01", "Linear Inc")],
        )

        self.assertEqual(report.matched, [])
        self.assertEqual(report.unmatched_internal, ["li_1", "li_2"])
        self.assertEqual(report.unmatched_external, ["ba_1"])
        self.assertEqual(
            [(item["internal_id"], item["candidate_external_ids"]) for item in report.ambiguous],
            [("li_1", ["ba_1"]), ("li_2", ["ba_1"])],
        )


if __name__ == "__main__":
    unittest.main()

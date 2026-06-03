import unittest

from src.sync import ApiError, FakeTransactionApi, TransactionStore, sync_transactions


def txn(txn_id, amount=100, merchant="Coffee", posted_at="2026-06-01"):
    return {
        "id": txn_id,
        "amount_cents": amount,
        "merchant": merchant,
        "posted_at": posted_at,
    }


class HiddenTransactionSyncTests(unittest.TestCase):
    def test_retries_retryable_errors(self):
        api = FakeTransactionApi(
            {
                None: {"transactions": [txn("t1")], "next_cursor": "page_2"},
                "page_2": {"transactions": [txn("t2")], "next_cursor": None},
            },
            failures={"page_2": [503, 503]},
        )
        store = TransactionStore()

        inserted = sync_transactions(api, store, max_retries=2)

        self.assertEqual(inserted, 2)
        self.assertEqual(api.calls, [None, "page_2", "page_2", "page_2"])
        self.assertEqual(sorted(store.transactions), ["t1", "t2"])

    def test_does_not_retry_non_retryable_errors(self):
        api = FakeTransactionApi(
            {
                None: {"transactions": [txn("t1")], "next_cursor": "page_2"},
                "page_2": {"transactions": [txn("t2")], "next_cursor": None},
            },
            failures={"page_2": [400]},
        )
        store = TransactionStore()

        with self.assertRaises(ApiError):
            sync_transactions(api, store, max_retries=3)

        self.assertEqual(api.calls, [None, "page_2"])
        self.assertEqual(sorted(store.transactions), ["t1"])
        self.assertEqual(store.cursor, "page_2")

    def test_existing_cursor_resumes_from_next_page(self):
        api = FakeTransactionApi({
            "page_2": {"transactions": [txn("t2")], "next_cursor": None},
        })
        store = TransactionStore()
        store.cursor = "page_2"

        inserted = sync_transactions(api, store)

        self.assertEqual(inserted, 1)
        self.assertEqual(api.calls, ["page_2"])
        self.assertIsNone(store.cursor)


if __name__ == "__main__":
    unittest.main()

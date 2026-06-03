import unittest

from src.sync import FakeTransactionApi, TransactionStore, sync_transactions


def txn(txn_id, amount=100, merchant="Coffee", posted_at="2026-06-01"):
    return {
        "id": txn_id,
        "amount_cents": amount,
        "merchant": merchant,
        "posted_at": posted_at,
    }


class TransactionSyncTests(unittest.TestCase):
    def test_single_page_import_still_works(self):
        api = FakeTransactionApi({
            None: {"transactions": [txn("t1"), txn("t2")], "next_cursor": None},
        })
        store = TransactionStore()

        inserted = sync_transactions(api, store)

        self.assertEqual(inserted, 2)
        self.assertEqual(sorted(store.transactions), ["t1", "t2"])
        self.assertIsNone(store.cursor)

    def test_fetches_all_pages(self):
        api = FakeTransactionApi({
            None: {"transactions": [txn("t1")], "next_cursor": "page_2"},
            "page_2": {"transactions": [txn("t2")], "next_cursor": "page_3"},
            "page_3": {"transactions": [txn("t3")], "next_cursor": None},
        })
        store = TransactionStore()

        inserted = sync_transactions(api, store)

        self.assertEqual(inserted, 3)
        self.assertEqual(api.calls, [None, "page_2", "page_3"])
        self.assertEqual(sorted(store.transactions), ["t1", "t2", "t3"])

    def test_duplicate_transaction_ids_are_upserts_not_new_rows(self):
        api = FakeTransactionApi({
            None: {"transactions": [txn("t1", amount=100)], "next_cursor": "page_2"},
            "page_2": {"transactions": [txn("t1", amount=150), txn("t2")], "next_cursor": None},
        })
        store = TransactionStore()

        inserted = sync_transactions(api, store)

        self.assertEqual(inserted, 2)
        self.assertEqual(store.transactions["t1"].amount_cents, 150)


if __name__ == "__main__":
    unittest.main()

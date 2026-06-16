import requests


def match_receipts_to_transactions(base_url: str, token: str) -> dict[str, str]:
    """Return {transaction_id: receipt_id} for every matched receipt."""
    # TODO: fetch transactions and receipts, then join on (employee_id, amount_cents)
    raise NotImplementedError

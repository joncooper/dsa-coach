import requests


def match_transactions_to_trips(base_url: str, token: str) -> dict[str, str]:
    """Return {transaction_id: trip_id} for txns whose date falls within a trip."""
    # TODO: fetch transactions and trips, then join by employee and inclusive trip dates
    raise NotImplementedError

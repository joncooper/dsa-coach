import requests


def fetch_all_transactions(base_url: str, token: str) -> list[dict]:
    """Return every transaction from /v1/transactions?broken=1, retrying on 5xx."""
    # TODO: paginate and retry 5xx responses with bounded backoff
    raise NotImplementedError

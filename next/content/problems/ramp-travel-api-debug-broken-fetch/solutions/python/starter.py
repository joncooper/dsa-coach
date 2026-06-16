import requests


def fetch_all_bookings(base_url: str) -> list[dict]:
    """Return every booking. This implementation has a subtle pagination bug."""
    results: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict = {"limit": 10}
        if cursor is not None:
            params["cursor"] = cursor
        resp = requests.get(f"{base_url}/v1/bookings", params=params, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        results.extend(data["data"])
        cursor = data.get("cursor")
        if cursor is None:
            return results

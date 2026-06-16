import requests


def fetch_all_bookings(base_url: str) -> list[dict]:
    results: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict = {"limit": 20}
        if cursor is not None:
            params["cursor"] = cursor
        resp = requests.get(f"{base_url}/v1/bookings", params=params, timeout=5)
        resp.raise_for_status()
        body = resp.json()
        results.extend(body["data"])
        cursor = body.get("next_cursor")
        if cursor is None:
            return results

import time

import requests


def fetch_all_trips(base_url: str, token: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}"}
    results: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict = {"limit": 10}
        if cursor is not None:
            params["cursor"] = cursor
        resp = requests.get(f"{base_url}/v1/trips", headers=headers, params=params, timeout=10)
        if resp.status_code == 429:
            retry_after = float(resp.headers.get("Retry-After", "1"))
            time.sleep(retry_after)
            continue
        resp.raise_for_status()
        body = resp.json()
        results.extend(body["data"])
        cursor = body.get("next_cursor")
        if cursor is None:
            return results

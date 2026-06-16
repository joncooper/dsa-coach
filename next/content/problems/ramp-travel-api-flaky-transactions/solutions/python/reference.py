import time

import requests


def fetch_all_transactions(base_url: str, token: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}"}
    results: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict = {"limit": 20, "broken": 1}
        if cursor is not None:
            params["cursor"] = cursor

        backoff = 0.2
        for _ in range(5):
            resp = requests.get(f"{base_url}/v1/transactions", headers=headers, params=params, timeout=10)
            if resp.status_code < 500:
                break
            time.sleep(backoff)
            backoff *= 2
        else:
            resp.raise_for_status()
        resp.raise_for_status()

        body = resp.json()
        results.extend(body["data"])
        cursor = body.get("next_cursor")
        if cursor is None:
            return results

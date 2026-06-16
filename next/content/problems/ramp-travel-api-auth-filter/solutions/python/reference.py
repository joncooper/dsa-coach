import requests


def fetch_engineers(base_url: str, token: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}"}
    results: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict = {"department": "engineering", "limit": 5}
        if cursor is not None:
            params["cursor"] = cursor
        resp = requests.get(f"{base_url}/v1/employees", headers=headers, params=params, timeout=5)
        resp.raise_for_status()
        body = resp.json()
        results.extend(body["data"])
        cursor = body.get("next_cursor")
        if cursor is None:
            return results

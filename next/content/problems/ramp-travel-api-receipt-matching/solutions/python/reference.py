import requests


def _fetch_all(base_url: str, token: str, path: str, *, page_size: int) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}"}
    results: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict = {"limit": page_size}
        if cursor is not None:
            params["cursor"] = cursor
        resp = requests.get(f"{base_url}{path}", headers=headers, params=params, timeout=10)
        resp.raise_for_status()
        body = resp.json()
        results.extend(body["data"])
        cursor = body.get("next_cursor")
        if cursor is None:
            return results


def match_receipts_to_transactions(base_url: str, token: str) -> dict[str, str]:
    transactions = _fetch_all(base_url, token, "/v1/transactions", page_size=50)
    receipts = _fetch_all(base_url, token, "/v1/receipts", page_size=30)

    matches: dict[str, str] = {}
    by_key: dict[tuple[str, int], list[dict]] = {}
    for txn in transactions:
        by_key.setdefault((txn["employee_id"], txn["amount_cents"]), []).append(txn)

    for receipt in receipts:
        if receipt.get("amount_cents") is None:
            continue
        key = (receipt["employee_id"], receipt["amount_cents"])
        for txn in by_key.get(key, []):
            if txn["id"] in matches:
                continue
            matches[txn["id"]] = receipt["id"]
            break
    return matches

from datetime import date, timedelta

import requests


def weekly_spend(base_url: str, token: str) -> dict[str, int]:
    headers = {"Authorization": f"Bearer {token}"}
    txns: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict = {"limit": 50}
        if cursor is not None:
            params["cursor"] = cursor
        resp = requests.get(f"{base_url}/v1/transactions", headers=headers, params=params, timeout=10)
        resp.raise_for_status()
        body = resp.json()
        txns.extend(body["data"])
        cursor = body.get("next_cursor")
        if cursor is None:
            break

    totals: dict[str, int] = {}
    for txn in txns:
        d = date.fromisoformat(txn["timestamp"][:10])
        monday = d - timedelta(days=d.weekday())
        key = monday.isoformat()
        totals[key] = totals.get(key, 0) + txn["amount_cents"]
    return totals

import time
from datetime import date

import requests


def _get(url: str, *, headers: dict, params: dict) -> dict:
    while True:
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        if resp.status_code != 429:
            resp.raise_for_status()
            return resp.json()
        time.sleep(float(resp.headers.get("Retry-After", "1")))


def _fetch_all(base_url: str, token: str, path: str, *, page_size: int) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}"}
    results: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict = {"limit": page_size}
        if cursor is not None:
            params["cursor"] = cursor
        data = _get(f"{base_url}{path}", headers=headers, params=params)
        results.extend(data["data"])
        cursor = data.get("next_cursor")
        if cursor is None:
            return results


def match_transactions_to_trips(base_url: str, token: str) -> dict[str, str]:
    transactions = _fetch_all(base_url, token, "/v1/transactions", page_size=50)
    trips = _fetch_all(base_url, token, "/v1/trips", page_size=25)

    trips_by_employee: dict[str, list[dict]] = {}
    for trip in trips:
        trips_by_employee.setdefault(trip["employee_id"], []).append({
            "id": trip["id"],
            "start": date.fromisoformat(trip["start_date"]),
            "end": date.fromisoformat(trip["end_date"]),
        })

    matches: dict[str, str] = {}
    for txn in transactions:
        txn_date = date.fromisoformat(txn["timestamp"][:10])
        for trip in trips_by_employee.get(txn["employee_id"], []):
            if trip["start"] <= txn_date <= trip["end"]:
                matches[txn["id"]] = trip["id"]
                break
    return matches

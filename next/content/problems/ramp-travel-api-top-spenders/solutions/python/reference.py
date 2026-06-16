import requests


def _fetch_all_employees(base_url: str, token: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}"}
    results: list[dict] = []
    cursor: str | None = None
    while True:
        params: dict = {"limit": 5}
        if cursor is not None:
            params["cursor"] = cursor
        resp = requests.get(f"{base_url}/v1/employees", headers=headers, params=params, timeout=5)
        resp.raise_for_status()
        body = resp.json()
        results.extend(body["data"])
        cursor = body.get("next_cursor")
        if cursor is None:
            return results


def top_spenders(base_url: str, token: str, n: int = 5) -> list[tuple[str, int]]:
    headers = {"Authorization": f"Bearer {token}"}
    employees = _fetch_all_employees(base_url, token)
    totals: dict[str, int] = {}
    for employee in employees:
        resp = requests.get(
            f"{base_url}/v1/employees/{employee['id']}/trips",
            headers=headers,
            timeout=5,
        )
        resp.raise_for_status()
        trips = resp.json()["data"]
        totals[employee["id"]] = sum(trip["total_cost_cents"] for trip in trips)
    ranked = sorted(totals.items(), key=lambda item: item[1], reverse=True)
    return [(employee_id, total) for employee_id, total in ranked if total > 0][:n]

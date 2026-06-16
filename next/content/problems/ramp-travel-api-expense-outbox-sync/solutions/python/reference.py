import requests


def sync_expense_outbox(base_url: str, token: str, drafts: list[dict]) -> list[dict]:
    headers_base = {"Authorization": f"Bearer {token}"}
    cached_by_request_id = {}
    results = []

    for draft in drafts:
        request_id = draft["client_request_id"]

        if request_id not in cached_by_request_id:
            expense = {key: value for key, value in draft.items() if key != "client_request_id"}
            headers = {**headers_base, "Idempotency-Key": request_id}
            resp = requests.post(f"{base_url}/v1/expenses", headers=headers, json=expense, timeout=5)
            resp.raise_for_status()
            cached_by_request_id[request_id] = resp.json()

        created = cached_by_request_id[request_id]
        results.append(
            {
                "client_request_id": request_id,
                "expense_id": created["id"],
                "created_at": created["created_at"],
            }
        )

    return results

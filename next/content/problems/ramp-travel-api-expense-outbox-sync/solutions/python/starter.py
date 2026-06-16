import requests


def sync_expense_outbox(base_url: str, token: str, drafts: list[dict]) -> list[dict]:
    """Submit local expense drafts and return compact per-draft sync results."""
    raise NotImplementedError

import requests


def weekly_spend(base_url: str, token: str) -> dict[str, int]:
    """Return {week_start_iso: total_cents}; week_start_iso is the Monday of the week."""
    # TODO: fetch all transactions, bucket by Monday week start, and sum amount_cents
    raise NotImplementedError

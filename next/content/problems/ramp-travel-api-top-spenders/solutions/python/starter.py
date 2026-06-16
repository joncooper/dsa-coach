import requests


def top_spenders(base_url: str, token: str, n: int = 5) -> list[tuple[str, int]]:
    """Return [(employee_id, total_cents), ...], sorted by spend descending."""
    # TODO: list employees, fetch trips per employee, sum costs, sort, and return top n
    raise NotImplementedError

import requests


def fetch_all_trips(base_url: str, token: str) -> list[dict]:
    """Return every trip, handling 429 rate limiting with Retry-After."""
    # TODO: paginate, and retry the same request after a 429
    raise NotImplementedError

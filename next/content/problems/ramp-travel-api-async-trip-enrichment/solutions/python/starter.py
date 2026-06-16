import travel_api


async def enrich_trips(base_url: str, token: str, trip_ids: list[str]) -> list[dict]:
    """Fetch trip details asynchronously and return compact summaries in input order."""
    raise NotImplementedError

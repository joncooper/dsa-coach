import travel_api


async def employee_trip_totals(
    base_url: str,
    token: str,
    employee_ids: list[str],
    max_concurrency: int,
) -> list[dict]:
    """Fetch employee trips with bounded concurrency and aggregate spend."""
    raise NotImplementedError

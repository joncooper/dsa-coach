import asyncio
import travel_api


async def employee_trip_totals(
    base_url: str,
    token: str,
    employee_ids: list[str],
    max_concurrency: int,
) -> list[dict]:
    semaphore = asyncio.Semaphore(max(1, int(max_concurrency)))

    async def total_for(employee_id: str) -> dict:
        async with semaphore:
            trips = await travel_api.list_employee_trips(base_url, token, employee_id)
        return {
            "employee_id": employee_id,
            "total_cents": sum(trip["total_cost_cents"] for trip in trips),
            "trip_count": len(trips),
        }

    return await asyncio.gather(*(total_for(employee_id) for employee_id in employee_ids))

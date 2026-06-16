import asyncio
import travel_api


async def enrich_trips(base_url: str, token: str, trip_ids: list[str]) -> list[dict]:
    async def fetch_summary(trip_id: str) -> dict:
        trip = await travel_api.get_trip(base_url, token, trip_id)
        return {
            "trip_id": trip["id"],
            "employee_id": trip["employee_id"],
            "destination": trip["destination"],
            "total_cost_cents": trip["total_cost_cents"],
        }

    return await asyncio.gather(*(fetch_summary(trip_id) for trip_id in trip_ids))

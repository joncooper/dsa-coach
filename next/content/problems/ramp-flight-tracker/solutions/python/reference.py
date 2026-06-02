from collections import defaultdict


def user_locations(flights: list[list[str]], query_time: str) -> list[list[str]]:
    by_user = defaultdict(list)
    for user_id, origin, depart, destination, arrive in flights:
        by_user[user_id].append((depart, arrive, origin, destination))

    out = []
    for user_id in sorted(by_user):
        timeline = sorted(by_user[user_id], key=lambda flight: flight[0])
        status = "UNKNOWN"
        for depart, arrive, origin, destination in timeline:
            if query_time < depart:
                break
            if depart <= query_time < arrive:
                status = f"IN_FLIGHT:{origin}->{destination}"
            else:
                status = destination
        out.append([user_id, status])
    return out

def rate_limited(events: list[list[object]], limit: int, window: int) -> list[bool]:
    accepted = {}
    out = []
    for timestamp, user_id in events:
        queue = accepted.setdefault(user_id, [])
        while queue and queue[0] <= timestamp - window:
            queue.pop(0)
        if len(queue) < limit:
            queue.append(timestamp)
            out.append(True)
        else:
            out.append(False)
    return out

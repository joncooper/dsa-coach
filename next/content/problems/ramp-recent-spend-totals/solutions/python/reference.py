def recent_spend_totals(events: list[list[int]], window: int) -> list[int]:
    left = 0
    running_total = 0
    totals = []

    for event in events:
        timestamp, amount = event
        running_total += amount

        while events[left][0] < timestamp - window:
            running_total -= events[left][1]
            left += 1

        totals.append(running_total)

    return totals

def min_meeting_rooms(meetings: list[list[int]]) -> int:
    events = []
    for start, end in meetings:
        events.append((start, 1))
        events.append((end, -1))
    events.sort(key=lambda event: (event[0], event[1]))
    active = peak = 0
    for _, delta in events:
        active += delta
        peak = max(peak, active)
    return peak

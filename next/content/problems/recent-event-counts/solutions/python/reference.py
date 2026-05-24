def recent_event_counts(timestamps: list[int], window: int) -> list[int]:
    left = 0
    counts = []
    for right, timestamp in enumerate(timestamps):
        while timestamps[left] < timestamp - window:
            left += 1
        counts.append(right - left + 1)
    return counts

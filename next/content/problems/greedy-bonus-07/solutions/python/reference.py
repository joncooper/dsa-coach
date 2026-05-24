def min_rooms(intervals: list[list[int]]) -> int:
    starts = sorted(start for start, _ in intervals)
    ends = sorted(end for _, end in intervals)
    end_index = 0
    active = 0
    best = 0
    for start in starts:
        while end_index < len(ends) and ends[end_index] <= start:
            active -= 1
            end_index += 1
        active += 1
        best = max(best, active)
    return best

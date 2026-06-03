def covered_service_time(windows: list[list[int]]) -> int:
    if not windows:
        return 0

    ordered = sorted(windows)
    current_start, current_end = ordered[0]
    total = 0

    for start, end in ordered[1:]:
        if start > current_end:
            total += current_end - current_start
            current_start, current_end = start, end
        else:
            current_end = max(current_end, end)

    return total + current_end - current_start

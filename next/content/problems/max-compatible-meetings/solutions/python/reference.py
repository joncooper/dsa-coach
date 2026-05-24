def max_compatible_meetings(intervals: list[list[int]]) -> int:
    count = 0
    current_end = float('-inf')
    for start, end in sorted(intervals, key=lambda item: (item[1], item[0])):
        if start >= current_end:
            count += 1
            current_end = end
    return count

def minimum_average_gap_index(nums: list[int]) -> int:
    total = sum(nums)
    left = 0
    best_index = 0
    best_gap = None
    for index, num in enumerate(nums):
        left += num
        right_count = len(nums) - index - 1
        left_avg = left // (index + 1)
        right_avg = 0 if right_count == 0 else (total - left) // right_count
        gap = abs(left_avg - right_avg)
        if best_gap is None or gap < best_gap:
            best_gap = gap
            best_index = index
    return best_index

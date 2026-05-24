def longest_two_value_run(nums: list[int]) -> int:
    counts = {}
    left = 0
    best = 0
    for right, value in enumerate(nums):
        counts[value] = counts.get(value, 0) + 1
        while len(counts) > 2:
            counts[nums[left]] -= 1
            if counts[nums[left]] == 0:
                del counts[nums[left]]
            left += 1
        best = max(best, right - left + 1)
    return best

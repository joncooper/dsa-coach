def longest_mountain(nums: list[int]) -> int:
    best = 0
    index = 1
    while index < len(nums) - 1:
        is_peak = nums[index - 1] < nums[index] > nums[index + 1]
        if not is_peak:
            index += 1
            continue
        left = index - 1
        while left > 0 and nums[left - 1] < nums[left]:
            left -= 1
        right = index + 1
        while right < len(nums) - 1 and nums[right] > nums[right + 1]:
            right += 1
        best = max(best, right - left + 1)
        index = right + 1
    return best

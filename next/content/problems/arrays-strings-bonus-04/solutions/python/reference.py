def count_equilibrium_indices(nums: list[int]) -> int:
    total = sum(nums)
    left = 0
    count = 0
    for num in nums:
        if left == total - left - num:
            count += 1
        left += num
    return count

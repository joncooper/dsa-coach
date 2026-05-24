def count_target_sum_subarrays(nums: list[int], target: int) -> int:
    counts = {0: 1}
    prefix = 0
    total = 0
    for num in nums:
        prefix += num
        total += counts.get(prefix - target, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return total

def subset_sum_reachable(nums: list[int], target: int) -> bool:
    reachable = [False] * (target + 1)
    reachable[0] = True
    for num in nums:
        for total in range(target, num - 1, -1):
            reachable[total] = reachable[total] or reachable[total - num]
    return reachable[target]

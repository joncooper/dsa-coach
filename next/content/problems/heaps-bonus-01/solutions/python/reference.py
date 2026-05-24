def kth_largest(nums: list[int], k: int) -> int:
    return sorted(nums, reverse=True)[k - 1]

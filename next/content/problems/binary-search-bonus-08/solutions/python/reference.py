def split_array_min_largest(nums: list[int], k: int) -> int:
    def parts_needed(limit):
        parts = 1
        total = 0
        for num in nums:
            if total + num > limit:
                parts += 1
                total = 0
            total += num
        return parts
    left = max(nums)
    right = sum(nums)
    while left < right:
        mid = (left + right) // 2
        if parts_needed(mid) <= k:
            right = mid
        else:
            left = mid + 1
    return left

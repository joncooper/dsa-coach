def count_occurrences(nums: list[int], target: int) -> int:
    def lower(value):
        left = 0
        right = len(nums)
        while left < right:
            mid = (left + right) // 2
            if nums[mid] < value:
                left = mid + 1
            else:
                right = mid
        return left
    return lower(target + 1) - lower(target)

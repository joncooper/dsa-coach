def search_unknown_size(nums: list[int], target: int) -> int:
    if not nums:
        return -1
    bound = 1
    while bound < len(nums) and nums[bound] < target:
        bound *= 2
    left = bound // 2
    right = min(bound, len(nums) - 1)
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

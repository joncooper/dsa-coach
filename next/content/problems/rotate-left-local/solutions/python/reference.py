def rotate_left(nums: list[int], k: int) -> list[int]:
    if not nums:
        return []
    offset = k % len(nums)
    return nums[offset:] + nums[:offset]

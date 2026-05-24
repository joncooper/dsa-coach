def closest_pair_sum(nums: list[int], target: int) -> int:
    left = 0
    right = len(nums) - 1
    best = nums[0] + nums[1]
    while left < right:
        total = nums[left] + nums[right]
        if abs(total - target) < abs(best - target) or (abs(total - target) == abs(best - target) and total < best):
            best = total
        if total < target:
            left += 1
        elif total > target:
            right -= 1
        else:
            return total
    return best

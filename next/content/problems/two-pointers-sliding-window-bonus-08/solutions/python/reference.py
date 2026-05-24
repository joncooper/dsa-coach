def count_pairs_below(nums: list[int], threshold: int) -> int:
    values = sorted(nums)
    left = 0
    right = len(values) - 1
    count = 0
    while left < right:
        if values[left] + values[right] < threshold:
            count += right - left
            left += 1
        else:
            right -= 1
    return count

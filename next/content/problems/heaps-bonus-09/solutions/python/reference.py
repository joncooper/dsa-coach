def k_closest_numbers(nums: list[int], target: int, k: int) -> list[int]:
    chosen = sorted(nums, key=lambda num: (abs(num - target), num))[:k]
    return sorted(chosen)

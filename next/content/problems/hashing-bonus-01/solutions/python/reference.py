def contains_duplicate_within_k(nums: list[int], k: int) -> bool:
    last_seen = {}
    for index, num in enumerate(nums):
        if num in last_seen and index - last_seen[num] <= k:
            return True
        last_seen[num] = index
    return False

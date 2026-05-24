def can_partition_k_subsets(nums: list[int], k: int) -> bool:
    total = sum(nums)
    if k <= 0 or total % k != 0:
        return False
    target = total // k
    ordered = sorted(nums, reverse=True)
    if ordered and ordered[0] > target:
        return False
    buckets = [0] * k
    def backtrack(index):
        if index == len(ordered):
            return True
        seen = set()
        for bucket in range(k):
            if buckets[bucket] in seen:
                continue
            if buckets[bucket] + ordered[index] <= target:
                seen.add(buckets[bucket])
                buckets[bucket] += ordered[index]
                if backtrack(index + 1):
                    return True
                buckets[bucket] -= ordered[index]
            if buckets[bucket] == 0:
                break
        return False
    return backtrack(0)

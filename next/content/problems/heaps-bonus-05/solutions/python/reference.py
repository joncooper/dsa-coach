def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = {}
    for num in nums:
        counts[num] = counts.get(num, 0) + 1
    chosen = sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:k]
    return sorted(num for num, _ in chosen)

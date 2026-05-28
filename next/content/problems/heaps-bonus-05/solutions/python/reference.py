import heapq


def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = {}
    for num in nums:
        counts[num] = counts.get(num, 0) + 1

    heap = [(-count, num) for num, count in counts.items()]
    heapq.heapify(heap)
    chosen = [heapq.heappop(heap)[1] for _ in range(min(k, len(heap)))]
    return sorted(chosen)

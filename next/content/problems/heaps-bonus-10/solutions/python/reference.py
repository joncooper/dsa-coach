import heapq


def max_score_after_halving(nums: list[int], k: int) -> int:
    heap = [-num for num in nums]
    heapq.heapify(heap)
    total = sum(nums)

    for _ in range(k):
        if not heap:
            break
        value = -heapq.heappop(heap)
        if value <= 1:
            heapq.heappush(heap, -value)
            break
        reduced = (value + 1) // 2
        total -= value - reduced
        heapq.heappush(heap, -reduced)

    return total

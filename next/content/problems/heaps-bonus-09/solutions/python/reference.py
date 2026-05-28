import heapq


def k_closest_numbers(nums: list[int], target: int, k: int) -> list[int]:
    heap = [(abs(num - target), num) for num in nums]
    heapq.heapify(heap)
    chosen = [heapq.heappop(heap)[1] for _ in range(min(k, len(heap)))]
    return sorted(chosen)

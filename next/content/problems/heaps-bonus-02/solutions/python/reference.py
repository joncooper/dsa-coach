import heapq


def heapsort(nums: list[int]) -> list[int]:
    heap = nums[:]
    heapq.heapify(heap)
    return [heapq.heappop(heap) for _ in range(len(heap))]

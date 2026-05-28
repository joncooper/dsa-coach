import heapq


def kth_largest(nums: list[int], k: int) -> int:
    heap: list[int] = []
    for num in nums:
        if len(heap) < k:
            heapq.heappush(heap, num)
        elif num > heap[0]:
            heapq.heapreplace(heap, num)
    return heap[0]

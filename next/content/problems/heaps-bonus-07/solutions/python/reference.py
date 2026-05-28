import heapq


def k_weakest_rows(grid: list[list[int]], k: int) -> list[int]:
    heap = [(sum(row), index) for index, row in enumerate(grid)]
    heapq.heapify(heap)
    return [heapq.heappop(heap)[1] for _ in range(min(k, len(heap)))]

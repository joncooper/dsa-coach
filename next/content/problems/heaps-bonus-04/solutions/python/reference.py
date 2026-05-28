import heapq


def min_connect_cost(ropes: list[int]) -> int:
    heap = ropes[:]
    heapq.heapify(heap)
    cost = 0

    while len(heap) > 1:
        merged = heapq.heappop(heap) + heapq.heappop(heap)
        cost += merged
        heapq.heappush(heap, merged)

    return cost

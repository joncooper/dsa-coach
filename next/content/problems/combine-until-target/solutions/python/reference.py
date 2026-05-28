import heapq


def combine_until_target(values: list[int], target: int) -> int:
    heap = values[:]
    heapq.heapify(heap)
    combines = 0

    while heap and heap[0] < target:
        if len(heap) < 2:
            return -1
        small = heapq.heappop(heap)
        large = heapq.heappop(heap)
        heapq.heappush(heap, small + 2 * large)
        combines += 1

    return -1 if not heap else combines

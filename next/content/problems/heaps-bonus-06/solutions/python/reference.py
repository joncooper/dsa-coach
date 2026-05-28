import heapq


def kth_smallest_pair_sum(a: list[int], b: list[int], k: int) -> int:
    if not a or not b or k <= 0:
        return 0

    heap = [(a[0] + b[j], 0, j) for j in range(min(len(b), k))]
    heapq.heapify(heap)
    current = 0

    for _ in range(k):
        current, i, j = heapq.heappop(heap)
        if i + 1 < len(a):
            heapq.heappush(heap, (a[i + 1] + b[j], i + 1, j))

    return current

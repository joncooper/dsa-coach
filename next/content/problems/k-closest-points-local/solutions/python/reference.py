import heapq


def k_closest_points_local(points: list[list[int]], k: int) -> list[list[int]]:
    heap = [(x * x + y * y, x, y, point) for point in points for x, y in [point]]
    heapq.heapify(heap)
    return [heapq.heappop(heap)[3] for _ in range(min(k, len(heap)))]

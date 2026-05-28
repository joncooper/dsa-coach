import heapq


def print_order(jobs: list[list[int]]) -> list[int]:
    heap = [(-priority, job_id) for priority, job_id in jobs]
    heapq.heapify(heap)
    return [heapq.heappop(heap)[1] for _ in range(len(heap))]

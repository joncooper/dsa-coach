import heapq


def top_k_scores(scores: list[int], k: int) -> list[int]:
    if k <= 0:
        return []
    heap: list[int] = []
    for score in scores:
        if len(heap) < k:
            heapq.heappush(heap, score)
        elif score > heap[0]:
            heapq.heapreplace(heap, score)
    return sorted(heap, reverse=True)

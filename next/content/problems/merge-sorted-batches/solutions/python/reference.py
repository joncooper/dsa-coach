import heapq


def merge_sorted_batches(batches: list[list[int]]) -> list[int]:
    heap = []
    for batch_index, batch in enumerate(batches):
        if batch:
            heapq.heappush(heap, (batch[0], batch_index, 0))

    merged = []
    while heap:
        value, batch_index, value_index = heapq.heappop(heap)
        merged.append(value)
        value_index += 1
        if value_index < len(batches[batch_index]):
            heapq.heappush(heap, (batches[batch_index][value_index], batch_index, value_index))
    return merged

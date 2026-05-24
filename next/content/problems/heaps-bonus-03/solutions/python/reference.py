def last_stone_weight(stones: list[int]) -> int:
    heap = sorted(stones)
    while len(heap) > 1:
        y = heap.pop()
        x = heap.pop()
        if x != y:
            heap.append(y - x)
            heap.sort()
    return heap[0] if heap else 0

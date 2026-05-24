def min_connect_cost(ropes: list[int]) -> int:
    heap = sorted(ropes)
    cost = 0
    while len(heap) > 1:
        merged = heap.pop(0) + heap.pop(0)
        cost += merged
        heap.append(merged)
        heap.sort()
    return cost

def combine_until_target(values: list[int], target: int) -> int:
    heap = sorted(values)
    combines = 0
    while heap and heap[0] < target:
        if len(heap) < 2:
            return -1
        small = heap.pop(0)
        large = heap.pop(0)
        heap.append(small + 2 * large)
        heap.sort()
        combines += 1
    return -1 if not heap else combines

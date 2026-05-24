def max_truck_value(boxes: list[list[int]], capacity: int) -> int:
    remaining = capacity
    total = 0
    for units, value in sorted(boxes, key=lambda box: box[1], reverse=True):
        take = min(units, remaining)
        total += take * value
        remaining -= take
        if remaining == 0:
            break
    return total

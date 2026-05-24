def ship_capacity_local(weights: list[int], days: int) -> int:
    def can(capacity):
        used_days = 1
        load = 0
        for weight in weights:
            if load + weight > capacity:
                used_days += 1
                load = 0
            load += weight
        return used_days <= days
    left = max(weights)
    right = sum(weights)
    while left < right:
        mid = (left + right) // 2
        if can(mid):
            right = mid
        else:
            left = mid + 1
    return left

def start_station(fuel: list[int], cost: list[int]) -> int:
    if not fuel:
        return 0
    total = 0
    tank = 0
    start = 0
    for index, amount in enumerate(fuel):
        diff = amount - cost[index]
        total += diff
        tank += diff
        if tank < 0:
            start = index + 1
            tank = 0
    return start if total >= 0 else -1

def min_cost_steps_local(costs: list[int]) -> int:
    before = 0
    current = 0
    for step in range(2, len(costs) + 1):
        before, current = current, min(current + costs[step - 1], before + costs[step - 2])
    return current

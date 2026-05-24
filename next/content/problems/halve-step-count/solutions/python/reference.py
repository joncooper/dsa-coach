def halve_step_count(n: int) -> int:
    steps = 0
    while n > 0:
        n //= 2
        steps += 1
    return steps

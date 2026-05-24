def nth_fibonacci(n: int) -> int:
    previous = 0
    current = 1
    for _ in range(n):
        previous, current = current, previous + current
    return previous

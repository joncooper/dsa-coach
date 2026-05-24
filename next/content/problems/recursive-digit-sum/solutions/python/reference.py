def recursive_digit_sum(n: int) -> int:
    if n < 10:
        return n
    return n % 10 + recursive_digit_sum(n // 10)

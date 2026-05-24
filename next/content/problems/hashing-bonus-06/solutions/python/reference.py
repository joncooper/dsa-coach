def symmetric_difference_size(a: list[int], b: list[int]) -> int:
    left = set(a)
    right = set(b)
    return len((left - right) | (right - left))

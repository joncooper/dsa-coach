def kth_smallest_pair_sum(a: list[int], b: list[int], k: int) -> int:
    sums = sorted(x + y for x in a for y in b)
    return sums[k - 1]

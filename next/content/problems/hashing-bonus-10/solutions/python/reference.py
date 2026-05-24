def longest_balanced_prefix(bits: list[int]) -> int:
    first_seen = {0: -1}
    balance = 0
    best = 0
    for index, bit in enumerate(bits):
        balance += 1 if bit == 1 else -1
        if balance in first_seen:
            best = max(best, index - first_seen[balance])
        else:
            first_seen[balance] = index
    return best

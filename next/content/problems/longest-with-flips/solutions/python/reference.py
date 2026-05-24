def longest_with_flips(bits: list[int], k: int) -> int:
    left = 0
    zeroes = 0
    best = 0
    for right, bit in enumerate(bits):
        if bit == 0:
            zeroes += 1
        while zeroes > k:
            if bits[left] == 0:
                zeroes -= 1
            left += 1
        best = max(best, right - left + 1)
    return best

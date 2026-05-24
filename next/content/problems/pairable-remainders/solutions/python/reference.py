def pairable_remainders(nums: list[int], k: int) -> bool:
    if len(nums) % 2 == 1:
        return False
    counts = {}
    for num in nums:
        remainder = num % k
        counts[remainder] = counts.get(remainder, 0) + 1
    for remainder, count in counts.items():
        complement = (-remainder) % k
        if remainder == complement:
            if count % 2 != 0:
                return False
        elif count != counts.get(complement, 0):
            return False
    return True

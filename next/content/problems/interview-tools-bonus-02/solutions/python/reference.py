def unpaired_number(nums: list[int]) -> int:
    unmatched = set()
    for value in nums:
        if value in unmatched:
            unmatched.discard(value)
        else:
            unmatched.add(value)
    return next(iter(unmatched))

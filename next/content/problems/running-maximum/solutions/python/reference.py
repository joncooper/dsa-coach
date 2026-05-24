def running_maximum(nums):
    out = []
    best = None
    for value in nums:
        best = value if best is None else max(best, value)
        out.append(best)
    return out

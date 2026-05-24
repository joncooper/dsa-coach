def scan_checkpoints(input_text):
    rows = [line for line in input_text.split("\n") if line]
    sorted_prior = []
    exceeded = 0
    import bisect
    for row in rows:
        count = 0
        for ch in row:
            if ch == "#":
                break
            if ch == "*":
                count += 1
        if sorted_prior:
            median_index = (len(sorted_prior) - 1) // 2
            median = sorted_prior[median_index]
            if count > median:
                exceeded += 1
        bisect.insort(sorted_prior, count)
    return exceeded

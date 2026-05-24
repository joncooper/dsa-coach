def max_revenue_window(input_text):
    lines = [line for line in input_text.split("\n") if line.strip()]
    if not lines:
        return 0
    k = int(lines[0])
    days = [int(line) for line in lines[1:]]
    if len(days) < k:
        return 0
    current = sum(days[:k])
    best = current
    for i in range(k, len(days)):
        current += days[i] - days[i - k]
        if current > best:
            best = current
    return best

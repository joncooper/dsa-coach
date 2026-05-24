def running_median(stream: list[int]) -> list[float]:
    values = []
    out = []
    for value in stream:
        values.append(value)
        values.sort()
        n = len(values)
        if n % 2:
            out.append(float(values[n // 2]))
        else:
            out.append((values[n // 2 - 1] + values[n // 2]) / 2.0)
    return out

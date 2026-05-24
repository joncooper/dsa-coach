def errors_per_hour(lines: list[str]) -> dict:
    counts = {}
    for line in lines:
        parts = line.split(' ', 2)
        if len(parts) < 2:
            continue
        timestamp, level = parts[0], parts[1]
        if level != 'ERROR' or len(timestamp) < 13 or timestamp[10] != 'T':
            continue
        hour = timestamp[:13]
        counts[hour] = counts.get(hour, 0) + 1
    return counts

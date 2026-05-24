def balanced_pair_count(input_text):
    counts = {}
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        value = int(line)
        counts[value] = counts.get(value, 0) + 1
    pairs = 0
    for count in counts.values():
        pairs += count * (count - 1) // 2
    return pairs

def elevation_pairs(input_text):
    lines = [line for line in input_text.split("\n") if line.strip()]
    if not lines:
        return 0
    target = int(lines[0])
    values = [int(line) for line in lines[1:]]
    counts = {}
    pairs = 0
    for value in values:
        pairs += counts.get(target - value, 0)
        counts[value] = counts.get(value, 0) + 1
    return pairs

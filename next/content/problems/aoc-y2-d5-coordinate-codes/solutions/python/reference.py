def max_manhattan(input_text):
    steps = {"NN": (1, 0), "SS": (-1, 0), "EE": (0, 1), "WW": (0, -1)}
    best = 0
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        row = 0
        col = 0
        for i in range(0, len(line), 2):
            pair = line[i:i + 2]
            dr, dc = steps[pair]
            row += dr
            col += dc
        distance = abs(row) + abs(col)
        if distance > best:
            best = distance
    return best

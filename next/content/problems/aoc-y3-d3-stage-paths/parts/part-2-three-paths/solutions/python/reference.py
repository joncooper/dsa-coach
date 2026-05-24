def three_paths_sum(input_text):
    rows = [line for line in input_text.split("\n") if line]
    if not rows:
        return 0
    width = len(rows[0])
    total = 0
    for dr, dc in [(1, 1), (1, 2), (2, 1)]:
        r = 0
        c = 0
        while r < len(rows) and c < width:
            cell = rows[r][c]
            if cell == "#":
                break
            if cell == "T":
                total += 1
            r += dr
            c += dc
    return total

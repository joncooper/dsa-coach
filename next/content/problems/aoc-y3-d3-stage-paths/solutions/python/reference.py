def diagonal_count(input_text):
    rows = [line for line in input_text.split("\n") if line]
    if not rows:
        return 0
    width = len(rows[0])
    r = 0
    c = 0
    count = 0
    while r < len(rows) and c < width:
        cell = rows[r][c]
        if cell == "#":
            break
        if cell == "T":
            count += 1
        r += 1
        c += 1
    return count

def slope_walk(input_text):
    rows = [line for line in input_text.split("\n") if line]
    if not rows:
        return 0
    width = len(rows[0])
    trees = 0
    for r in range(len(rows)):
        c = (r * 3) % width
        if rows[r][c] == "#":
            trees += 1
    return trees

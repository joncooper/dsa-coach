def slope_walk_product(input_text):
    rows = [line for line in input_text.split("\n") if line]
    if not rows:
        return 0
    width = len(rows[0])
    slopes = [(1, 1), (3, 1), (5, 1), (7, 1), (1, 2)]
    product = 1
    for dx, dy in slopes:
        trees = 0
        r = 0
        c = 0
        while r < len(rows):
            if rows[r][c % width] == "#":
                trees += 1
            r += dy
            c += dx
        product *= trees
    return product

def scan_aisle(input_text):
    rows = [line for line in input_text.split("\n") if line]
    relics = 0
    for row in rows:
        for ch in row:
            if ch == "#":
                break
            if ch == "*":
                relics += 1
    return relics

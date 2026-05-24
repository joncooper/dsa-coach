def valid_roster_total(input_text):
    required = {"food", "craft", "music"}
    total = 0
    for block in input_text.split("\n\n"):
        categories = set()
        item_count = 0
        for line in block.split("\n"):
            line = line.strip()
            if ":" not in line:
                continue
            category, items = line.split(":", 1)
            categories.add(category)
            item_count += len(items.split(","))
        if required <= categories:
            total += item_count
    return total

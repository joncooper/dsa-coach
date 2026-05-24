def heaviest_category(input_text):
    required = {"food", "craft", "music"}
    totals = {}
    for block in input_text.split("\n\n"):
        roster_categories = set()
        per_category = {}
        for line in block.split("\n"):
            line = line.strip()
            if ":" not in line:
                continue
            category, items = line.split(":", 1)
            roster_categories.add(category)
            per_category[category] = per_category.get(category, 0) + len(items.split(","))
        if required <= roster_categories:
            for cat, count in per_category.items():
                totals[cat] = totals.get(cat, 0) + count
    if not totals:
        return ""
    best = None
    best_score = -1
    for cat in sorted(totals):
        if totals[cat] > best_score:
            best_score = totals[cat]
            best = cat
    return best

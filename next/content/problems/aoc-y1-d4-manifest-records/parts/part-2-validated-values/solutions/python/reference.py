def count_strict_records(input_text):
    seasons = {"fall", "winter", "spring", "summer"}
    grades = {"A", "B", "C", "D", "F"}
    required = {"id", "name", "age", "grade", "cohort"}
    valid = 0
    for block in input_text.split("\n\n"):
        if not block.strip():
            continue
        fields = {}
        for token in block.split():
            if ":" in token:
                key, value = token.split(":", 1)
                fields[key] = value
        if not required <= set(fields):
            continue
        if not (fields["id"].isdigit() and len(fields["id"]) == 9):
            continue
        name = fields["name"]
        if not (1 <= len(name) <= 32 and all(c.isalpha() or c == "-" for c in name)):
            continue
        age_str = fields["age"]
        if not age_str.isdigit() or not (16 <= int(age_str) <= 99):
            continue
        if fields["grade"] not in grades:
            continue
        if fields["cohort"] not in seasons:
            continue
        valid += 1
    return valid

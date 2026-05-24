def count_complete_records(input_text):
    required = {"id", "name", "age", "grade", "cohort"}
    count = 0
    for block in input_text.split("\n\n"):
        if not block.strip():
            continue
        keys = set()
        for token in block.split():
            if ":" in token:
                key, _ = token.split(":", 1)
                keys.add(key)
        if required <= keys:
            count += 1
    return count

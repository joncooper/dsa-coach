def merge_sorted_batches(batches: list[list[int]]) -> list[int]:
    merged = []
    for batch in batches:
        merged.extend(batch)
    return sorted(merged)

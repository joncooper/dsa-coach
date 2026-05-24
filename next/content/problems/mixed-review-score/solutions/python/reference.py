def mixed_review_score(results: list[list[object]]) -> int:
    total = 0
    for difficulty, passed in results:
        if passed:
            total += difficulty
    return total

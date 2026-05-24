def top_k_scores(scores: list[int], k: int) -> list[int]:
    if k <= 0:
        return []
    return sorted(scores, reverse=True)[:k]

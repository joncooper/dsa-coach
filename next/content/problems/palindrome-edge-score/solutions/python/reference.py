def palindrome_edge_score(text: str) -> int:
    left = 0
    right = len(text) - 1
    score = 0
    while left < right and text[left] == text[right]:
        score += 1
        left += 1
        right -= 1
    return score

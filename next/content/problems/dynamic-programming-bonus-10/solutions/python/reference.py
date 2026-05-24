def longest_palindrome_length(text: str) -> int:
    best = 0
    def expand(left, right):
        nonlocal best
        while left >= 0 and right < len(text) and text[left] == text[right]:
            left -= 1
            right += 1
        best = max(best, right - left - 1)
    for center in range(len(text)):
        expand(center, center)
        expand(center, center + 1)
    return best

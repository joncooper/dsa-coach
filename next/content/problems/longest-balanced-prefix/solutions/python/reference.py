def longest_balanced_prefix(text: str) -> int:
    balance = 0
    best = 0
    for index, char in enumerate(text):
        balance += 1 if char == "A" else -1
        if balance == 0:
            best = index + 1
    return best

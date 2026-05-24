def letter_case_combinations(text: str) -> list[str]:
    result = []
    chars = []
    def backtrack(index):
        if index == len(text):
            result.append(''.join(chars))
            return
        ch = text[index]
        if ch.isalpha():
            chars.append(ch.lower())
            backtrack(index + 1)
            chars.pop()
            chars.append(ch.upper())
            backtrack(index + 1)
            chars.pop()
        else:
            chars.append(ch)
            backtrack(index + 1)
            chars.pop()
    backtrack(0)
    return sorted(result)

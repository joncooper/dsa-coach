def keypad_letter_words(digits: str) -> list[str]:
    mapping = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}
    if not digits or any(digit not in mapping for digit in digits):
        return []
    result = []
    letters = []
    def backtrack(index):
        if index == len(digits):
            result.append(''.join(letters))
            return
        for letter in mapping[digits[index]]:
            letters.append(letter)
            backtrack(index + 1)
            letters.pop()
    backtrack(0)
    return sorted(result)

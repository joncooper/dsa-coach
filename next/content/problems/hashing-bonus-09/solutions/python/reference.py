def can_form_word(word: str, letters: list[str]) -> bool:
    counts = {}
    for letter in letters:
        counts[letter] = counts.get(letter, 0) + 1
    for char in word:
        if counts.get(char, 0) == 0:
            return False
        counts[char] -= 1
    return True

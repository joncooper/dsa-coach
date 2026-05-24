def count_vowels(text: str) -> int:
    vowels = set("aeiou")
    count = 0
    for char in text.lower():
        if char in vowels:
            count += 1
    return count

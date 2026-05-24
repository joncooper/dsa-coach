def group_by_first_letter(words: list[str]) -> dict[str, list[str]]:
    groups = {}
    for word in words:
        if not word:
            continue
        groups.setdefault(word[0], []).append(word)
    return {key: groups[key] for key in sorted(groups)}

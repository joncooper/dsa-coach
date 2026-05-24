def first_unique_token(tokens: list[str]) -> str:
    counts = {}
    for token in tokens:
        counts[token] = counts.get(token, 0) + 1
    for token in tokens:
        if counts[token] == 1:
            return token
    return ""

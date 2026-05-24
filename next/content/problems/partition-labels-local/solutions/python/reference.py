def partition_labels_local(text: str) -> list[int]:
    last = {char: index for index, char in enumerate(text)}
    parts = []
    start = 0
    end = 0
    for index, char in enumerate(text):
        end = max(end, last[char])
        if index == end:
            parts.append(end - start + 1)
            start = index + 1
    return parts

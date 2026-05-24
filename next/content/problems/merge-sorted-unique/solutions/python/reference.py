def merge_sorted_unique(a: list[int], b: list[int]) -> list[int]:
    result = []
    i = 0
    j = 0
    while i < len(a) or j < len(b):
        if j >= len(b) or (i < len(a) and a[i] <= b[j]):
            value = a[i]
            i += 1
        else:
            value = b[j]
            j += 1
        if not result or result[-1] != value:
            result.append(value)
    return result

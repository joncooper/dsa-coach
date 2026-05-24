def merge_two_linked_lists(a: list[int], b: list[int]) -> list[int]:
    left = 0
    right = 0
    merged = []
    while left < len(a) and right < len(b):
        if a[left] <= b[right]:
            merged.append(a[left])
            left += 1
        else:
            merged.append(b[right])
            right += 1
    merged.extend(a[left:])
    merged.extend(b[right:])
    return merged

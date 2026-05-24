def palindrome_linked_list_local(values: list[int]) -> bool:
    left = 0
    right = len(values) - 1
    while left < right:
        if values[left] != values[right]:
            return False
        left += 1
        right -= 1
    return True

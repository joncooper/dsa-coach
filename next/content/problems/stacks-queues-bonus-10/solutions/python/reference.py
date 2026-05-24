def sliding_window_max(nums: list[int], k: int) -> list[int]:
    deque = []
    result = []
    for right, num in enumerate(nums):
        while deque and deque[0] <= right - k:
            deque.pop(0)
        while deque and nums[deque[-1]] <= num:
            deque.pop()
        deque.append(right)
        if right >= k - 1:
            result.append(nums[deque[0]])
    return result

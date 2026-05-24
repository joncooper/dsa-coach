def moving_averages(nums: list[int], window: int) -> list[float]:
    queue = []
    total = 0
    averages = []
    for num in nums:
        queue.append(num)
        total += num
        if len(queue) > window:
            total -= queue.pop(0)
        averages.append(total / len(queue))
    return averages

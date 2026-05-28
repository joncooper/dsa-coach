import heapq


def running_medians_local(nums: list[int]) -> list[float]:
    lower: list[int] = []
    upper: list[int] = []
    medians = []

    for num in nums:
        if not lower or num <= -lower[0]:
            heapq.heappush(lower, -num)
        else:
            heapq.heappush(upper, num)

        if len(lower) > len(upper) + 1:
            heapq.heappush(upper, -heapq.heappop(lower))
        elif len(upper) > len(lower):
            heapq.heappush(lower, -heapq.heappop(upper))

        if (len(lower) + len(upper)) % 2 == 1:
            medians.append(-lower[0])
        else:
            medians.append((-lower[0] + upper[0]) / 2)

    return medians

def sliding_window_median(nums: list[int], k: int) -> list[float]:
    if not nums or k <= 0 or k > len(nums):
        return []
    window = sorted(nums[:k])
    out = []
    for index in range(len(nums) - k + 1):
        if k % 2:
            out.append(float(window[k // 2]))
        else:
            out.append((window[k // 2 - 1] + window[k // 2]) / 2.0)
        if index + k < len(nums):
            window.remove(nums[index])
            window.append(nums[index + k])
            window.sort()
    return out

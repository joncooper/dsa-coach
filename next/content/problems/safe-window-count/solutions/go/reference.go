package solution

func CountSafeWindows(nums []int, k int, limit int) int {
	if k <= 0 || k > len(nums) {
		return 0
	}
	windowSum := 0
	for index := 0; index < k; index++ {
		windowSum += nums[index]
	}
	count := 0
	if windowSum <= limit {
		count = 1
	}
	for right := k; right < len(nums); right++ {
		windowSum += nums[right] - nums[right-k]
		if windowSum <= limit {
			count++
		}
	}
	return count
}

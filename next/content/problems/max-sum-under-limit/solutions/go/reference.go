package solution

func MaxSumUnderLimit(nums []int, limit int) int {
	left := 0
	total := 0
	best := 0
	for right, num := range nums {
		total += num
		for left <= right && total > limit {
			total -= nums[left]
			left++
		}
		if total > best {
			best = total
		}
	}
	return best
}

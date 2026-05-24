package solution

func LongestWithinLimit(nums []int, limit int) int {
	left := 0
	total := 0
	best := 0
	for right, num := range nums {
		total += num
		for total > limit && left <= right {
			total -= nums[left]
			left++
		}
		length := right - left + 1
		if length > best {
			best = length
		}
	}
	return best
}

package solution

func ClosestPairSum(nums []int, target int) int {
	left := 0
	right := len(nums) - 1
	best := nums[0] + nums[1]
	for left < right {
		total := nums[left] + nums[right]
		if abs(total-target) < abs(best-target) || (abs(total-target) == abs(best-target) && total < best) {
			best = total
		}
		if total < target {
			left++
		} else if total > target {
			right--
		} else {
			return total
		}
	}
	return best
}

func abs(value int) int {
	if value < 0 {
		return -value
	}
	return value
}

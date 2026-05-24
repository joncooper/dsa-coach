package solution

func MaxSubarraySum(nums []int) int {
	best := nums[0]
	current := nums[0]
	for index := 1; index < len(nums); index++ {
		num := nums[index]
		if current+num < num {
			current = num
		} else {
			current += num
		}
		if current > best {
			best = current
		}
	}
	return best
}

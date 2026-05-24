package solution

func MinWindowForSum(nums []int, target int) int {
	left := 0
	total := 0
	best := len(nums) + 1
	for right, num := range nums {
		total += num
		for total >= target {
			length := right - left + 1
			if length < best {
				best = length
			}
			total -= nums[left]
			left++
		}
	}
	if best == len(nums)+1 {
		return 0
	}
	return best
}

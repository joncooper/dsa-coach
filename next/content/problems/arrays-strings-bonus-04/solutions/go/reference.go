package solution

func CountEquilibriumIndices(nums []int) int {
	total := 0
	for _, num := range nums {
		total += num
	}
	left := 0
	count := 0
	for _, num := range nums {
		if left == total-left-num {
			count++
		}
		left += num
	}
	return count
}

package solution

func PivotIndex(nums []int) int {
	total := 0
	for _, num := range nums {
		total += num
	}
	left := 0
	for index, num := range nums {
		if left == total-left-num {
			return index
		}
		left += num
	}
	return -1
}

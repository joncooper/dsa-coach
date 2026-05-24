package solution

func FirstNegativeIndex(nums []int) int {
	for index, num := range nums {
		if num < 0 {
			return index
		}
	}
	return -1
}

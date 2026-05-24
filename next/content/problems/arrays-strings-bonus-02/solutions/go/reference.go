package solution

func RunningRangeWidth(nums []int) []int {
	result := []int{}
	low := 0
	high := 0
	for index, num := range nums {
		if index == 0 || num < low {
			low = num
		}
		if index == 0 || num > high {
			high = num
		}
		result = append(result, high-low)
	}
	return result
}

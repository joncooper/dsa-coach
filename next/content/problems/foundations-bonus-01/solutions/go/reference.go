package solution

func RunningMaximum(nums []int) []int {
	result := []int{}
	best := 0
	for index, num := range nums {
		if index == 0 || num > best {
			best = num
		}
		result = append(result, best)
	}
	return result
}

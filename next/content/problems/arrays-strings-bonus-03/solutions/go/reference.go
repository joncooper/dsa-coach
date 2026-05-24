package solution

func MoveZeros(nums []int) []int {
	result := []int{}
	zeros := 0
	for _, num := range nums {
		if num == 0 {
			zeros++
		} else {
			result = append(result, num)
		}
	}
	for zeros > 0 {
		result = append(result, 0)
		zeros--
	}
	return result
}

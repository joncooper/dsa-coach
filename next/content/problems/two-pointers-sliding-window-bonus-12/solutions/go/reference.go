package solution

func SortBinaryArray(bits []int) []int {
	result := append([]int{}, bits...)
	left := 0
	right := len(result) - 1
	for left < right {
		for left < right && result[left] == 0 {
			left++
		}
		for left < right && result[right] == 1 {
			right--
		}
		if left < right {
			result[left] = 0
			result[right] = 1
		}
	}
	return result
}

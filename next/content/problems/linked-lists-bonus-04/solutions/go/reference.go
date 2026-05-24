package solution

func ReverseList(values []int) []int {
	result := make([]int, 0, len(values))
	for index := len(values) - 1; index >= 0; index-- {
		result = append(result, values[index])
	}
	return result
}

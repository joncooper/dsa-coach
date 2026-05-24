package solution

func RemoveNthFromEnd(values []int, n int) []int {
	index := len(values) - n
	if index < 0 || index >= len(values) {
		return append([]int{}, values...)
	}
	result := append([]int{}, values[:index]...)
	result = append(result, values[index+1:]...)
	return result
}

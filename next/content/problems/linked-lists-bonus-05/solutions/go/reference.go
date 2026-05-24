package solution

func InsertAfterIndex(values []int, index int, value int) []int {
	if index < 0 || index >= len(values) {
		return append([]int{}, values...)
	}
	result := append([]int{}, values[:index+1]...)
	result = append(result, value)
	result = append(result, values[index+1:]...)
	return result
}

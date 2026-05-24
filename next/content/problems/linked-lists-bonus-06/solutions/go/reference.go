package solution

func DedupSortedList(values []int) []int {
	result := []int{}
	for _, value := range values {
		if len(result) == 0 || result[len(result)-1] != value {
			result = append(result, value)
		}
	}
	return result
}

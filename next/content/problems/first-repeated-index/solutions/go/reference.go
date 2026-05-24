package solution

func FirstRepeatedIndex(values []int) int {
	seen := map[int]bool{}
	for index, value := range values {
		if seen[value] {
			return index
		}
		seen[value] = true
	}
	return -1
}

package solution

func FirstRepeatedValue(values []int) *int {
	seen := map[int]bool{}
	for _, value := range values {
		if seen[value] {
			return &value
		}
		seen[value] = true
	}
	return nil
}

package solution

func CountDistinct(values []int) int {
	seen := map[int]bool{}
	for _, value := range values {
		seen[value] = true
	}
	return len(seen)
}

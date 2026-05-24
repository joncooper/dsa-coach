package solution

func SymmetricDifferenceSize(a []int, b []int) int {
	left := map[int]bool{}
	right := map[int]bool{}
	for _, value := range a {
		left[value] = true
	}
	for _, value := range b {
		right[value] = true
	}
	total := 0
	for value := range left {
		if !right[value] {
			total++
		}
	}
	for value := range right {
		if !left[value] {
			total++
		}
	}
	return total
}

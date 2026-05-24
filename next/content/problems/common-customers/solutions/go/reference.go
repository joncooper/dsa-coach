package solution

func CommonCustomers(morning []int, evening []int) int {
	seen := map[int]bool{}
	for _, customer := range morning {
		seen[customer] = true
	}
	common := map[int]bool{}
	for _, customer := range evening {
		if seen[customer] {
			common[customer] = true
		}
	}
	return len(common)
}

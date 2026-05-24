package solution

func LongestTrueRun(flags []bool) int {
	best := 0
	current := 0
	for _, flag := range flags {
		if flag {
			current++
			if current > best {
				best = current
			}
		} else {
			current = 0
		}
	}
	return best
}

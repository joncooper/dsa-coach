package solution

func LongestBalancedPrefix(bits []int) int {
	firstSeen := map[int]int{0: -1}
	balance := 0
	best := 0
	for index, bit := range bits {
		if bit == 1 {
			balance++
		} else {
			balance--
		}
		if previous, ok := firstSeen[balance]; ok {
			length := index - previous
			if length > best {
				best = length
			}
		} else {
			firstSeen[balance] = index
		}
	}
	return best
}

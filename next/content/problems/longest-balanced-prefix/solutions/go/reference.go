package solution

func LongestBalancedPrefix(text string) int {
	balance := 0
	best := 0
	for index, char := range text {
		if char == 'A' {
			balance++
		} else {
			balance--
		}
		if balance == 0 {
			best = index + 1
		}
	}
	return best
}

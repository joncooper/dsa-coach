package solution

func LongestUniqueSubstring(text string) int {
	lastSeen := map[rune]int{}
	chars := []rune(text)
	left := 0
	best := 0
	for right, char := range chars {
		if previous, ok := lastSeen[char]; ok && previous >= left {
			left = previous + 1
		}
		lastSeen[char] = right
		length := right - left + 1
		if length > best {
			best = length
		}
	}
	return best
}

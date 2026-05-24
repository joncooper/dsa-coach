package solution

func PalindromeEdgeScore(text string) int {
	left := 0
	right := len(text) - 1
	score := 0
	for left < right && text[left] == text[right] {
		score++
		left++
		right--
	}
	return score
}

package solution

func LongestPalindromeLength(text string) int {
	best := 0
	expand := func(left int, right int) { for left >= 0 && right < len(text) && text[left] == text[right] { left--; right++ }; best = max(best, right-left-1) }
	for center := 0; center < len(text); center++ { expand(center, center); expand(center, center+1) }
	return best
}

func min(a int, b int) int { if a < b { return a }; return b }
func max(a int, b int) int { if a > b { return a }; return b }
func min3(a int, b int, c int) int { return min(min(a, b), c) }

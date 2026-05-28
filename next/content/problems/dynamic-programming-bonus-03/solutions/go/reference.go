package solution

func CountDecodings(text string) int {
	if len(text) == 0 || text[0] == '0' {
		return 0
	}
	dp := make([]int, len(text)+1)
	dp[0], dp[1] = 1, 1
	for index := 2; index <= len(text); index++ {
		one := int(text[index-1] - '0')
		two := int(text[index-2]-'0')*10 + int(text[index-1]-'0')
		if one >= 1 {
			dp[index] += dp[index-1]
		}
		if two >= 10 && two <= 26 {
			dp[index] += dp[index-2]
		}
	}
	return dp[len(text)]
}

func min(a int, b int) int {
	if a < b {
		return a
	}
	return b
}
func max(a int, b int) int {
	if a > b {
		return a
	}
	return b
}
func min3(a int, b int, c int) int { return min(min(a, b), c) }

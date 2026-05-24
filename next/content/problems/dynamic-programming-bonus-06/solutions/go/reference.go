package solution

func LongestCommonSubsequence(a string, b string) int {
	dp := make([][]int, len(a)+1)
	for i := range dp { dp[i] = make([]int, len(b)+1) }
	for i := 1; i <= len(a); i++ { for j := 1; j <= len(b); j++ { if a[i-1] == b[j-1] { dp[i][j] = dp[i-1][j-1] + 1 } else { dp[i][j] = max(dp[i-1][j], dp[i][j-1]) } } }
	return dp[len(a)][len(b)]
}

func min(a int, b int) int { if a < b { return a }; return b }
func max(a int, b int) int { if a > b { return a }; return b }
func min3(a int, b int, c int) int { return min(min(a, b), c) }

package solution

func CountChange(coins []int, amount int) int {
	dp := make([]int, amount+1)
	dp[0] = 1
	for _, coin := range coins { for total := coin; total <= amount; total++ { dp[total] += dp[total-coin] } }
	return dp[amount]
}

func min(a int, b int) int { if a < b { return a }; return b }
func max(a int, b int) int { if a > b { return a }; return b }
func min3(a int, b int, c int) int { return min(min(a, b), c) }

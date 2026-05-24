package solution

func CoinChangeMinLocal(coins []int, amount int) int {
	impossible := amount + 1
	dp := make([]int, amount+1)
	for index := range dp { dp[index] = impossible }
	dp[0] = 0
	for total := 1; total <= amount; total++ { for _, coin := range coins { if total >= coin { dp[total] = min(dp[total], dp[total-coin]+1) } } }
	if dp[amount] == impossible { return -1 }
	return dp[amount]
}

func min(a int, b int) int { if a < b { return a }; return b }
func max(a int, b int) int { if a > b { return a }; return b }
func min3(a int, b int, c int) int { return min(min(a, b), c) }

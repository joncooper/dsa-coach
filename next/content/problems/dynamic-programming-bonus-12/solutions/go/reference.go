package solution

func MaxProfitWithCooldown(prices []int) int {
	if len(prices) == 0 {
		return 0
	}
	hold, sold, rest := -prices[0], 0, 0
	for index := 1; index < len(prices); index++ {
		previousSold := sold
		sold = hold + prices[index]
		hold = max(hold, rest-prices[index])
		rest = max(rest, previousSold)
	}
	return max(sold, rest)
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

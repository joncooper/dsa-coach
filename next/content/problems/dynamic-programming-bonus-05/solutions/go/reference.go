package solution

func SubsetSumReachable(nums []int, target int) bool {
	reachable := make([]bool, target+1)
	reachable[0] = true
	for _, num := range nums { for total := target; total >= num; total-- { reachable[total] = reachable[total] || reachable[total-num] } }
	return reachable[target]
}

func min(a int, b int) int { if a < b { return a }; return b }
func max(a int, b int) int { if a > b { return a }; return b }
func min3(a int, b int, c int) int { return min(min(a, b), c) }

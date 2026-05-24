package solution

func LongestTwoValueRun(nums []int) int {
	counts := map[int]int{}
	left, best := 0, 0
	for right, value := range nums { counts[value]++; for len(counts) > 2 { leftValue := nums[left]; counts[leftValue]--; if counts[leftValue] == 0 { delete(counts, leftValue) }; left++ }; if right-left+1 > best { best = right-left+1 } }
	return best
}

package solution

func CountTargetSumSubarrays(nums []int, target int) int {
	counts := map[int]int{0: 1}
	prefix := 0
	total := 0
	for _, num := range nums {
		prefix += num
		total += counts[prefix-target]
		counts[prefix]++
	}
	return total
}

package solution

func TwoSumExists(nums []int, target int) bool {
	seen := map[int]bool{}
	for _, num := range nums {
		if seen[target-num] {
			return true
		}
		seen[num] = true
	}
	return false
}

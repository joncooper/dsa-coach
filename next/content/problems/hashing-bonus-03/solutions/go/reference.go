package solution

func MissingNumber(nums []int) int {
	seen := map[int]bool{}
	for _, num := range nums {
		seen[num] = true
	}
	for candidate := 0; candidate <= len(nums); candidate++ {
		if !seen[candidate] {
			return candidate
		}
	}
	return len(nums)
}

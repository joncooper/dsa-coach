package solution

func CountDistinctPairSums(nums []int) int {
	sums := map[int]bool{}
	for left := 0; left < len(nums); left++ {
		for right := left + 1; right < len(nums); right++ {
			sums[nums[left]+nums[right]] = true
		}
	}
	return len(sums)
}

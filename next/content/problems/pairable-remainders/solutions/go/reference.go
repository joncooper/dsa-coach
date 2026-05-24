package solution

func PairableRemainders(nums []int, k int) bool {
	if len(nums)%2 == 1 {
		return false
	}
	counts := map[int]int{}
	for _, num := range nums {
		remainder := ((num % k) + k) % k
		counts[remainder]++
	}
	for remainder, count := range counts {
		complement := (k - remainder) % k
		if remainder == complement {
			if count%2 != 0 {
				return false
			}
		} else if count != counts[complement] {
			return false
		}
	}
	return true
}

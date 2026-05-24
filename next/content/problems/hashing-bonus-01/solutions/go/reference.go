package solution

func ContainsDuplicateWithinK(nums []int, k int) bool {
	lastSeen := map[int]int{}
	for index, num := range nums {
		if previous, ok := lastSeen[num]; ok && index-previous <= k {
			return true
		}
		lastSeen[num] = index
	}
	return false
}

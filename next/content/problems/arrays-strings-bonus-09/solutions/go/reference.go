package solution

func DedupeSorted(nums []int) []int {
	result := []int{}
	for _, num := range nums {
		if len(result) == 0 || result[len(result)-1] != num {
			result = append(result, num)
		}
	}
	return result
}

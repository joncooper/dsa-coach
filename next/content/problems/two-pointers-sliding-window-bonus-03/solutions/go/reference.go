package solution

func RemoveElement(nums []int, value int) int {
	count := 0
	for _, num := range nums {
		if num != value {
			count++
		}
	}
	return count
}

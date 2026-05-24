package solution

func IsSortedAscending(nums []int) bool {
	for index := 1; index < len(nums); index++ {
		if nums[index] < nums[index-1] {
			return false
		}
	}
	return true
}

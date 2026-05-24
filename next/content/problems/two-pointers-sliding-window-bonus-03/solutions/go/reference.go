package solution

func RemoveElement(nums []int, value int) int {
	write := 0
	for _, num := range nums {
		if num != value {
			nums[write] = num
			write++
		}
	}
	return write
}

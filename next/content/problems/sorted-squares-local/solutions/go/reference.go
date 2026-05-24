package solution

func SortedSquaresLocal(nums []int) []int {
	result := make([]int, len(nums))
	left := 0
	right := len(nums) - 1
	for write := len(nums) - 1; write >= 0; write-- {
		leftSquare := nums[left] * nums[left]
		rightSquare := nums[right] * nums[right]
		if leftSquare > rightSquare {
			result[write] = leftSquare
			left++
		} else {
			result[write] = rightSquare
			right--
		}
	}
	return result
}

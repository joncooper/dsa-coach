package solution

func RotateLeft(nums []int, k int) []int {
	if len(nums) == 0 {
		return []int{}
	}
	offset := k % len(nums)
	result := append([]int{}, nums[offset:]...)
	result = append(result, nums[:offset]...)
	return result
}

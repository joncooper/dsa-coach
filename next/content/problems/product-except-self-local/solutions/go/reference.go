package solution

func ProductExceptSelfLocal(nums []int) []int {
	result := make([]int, len(nums))
	for index := range result {
		result[index] = 1
	}
	prefix := 1
	for index, num := range nums {
		result[index] = prefix
		prefix *= num
	}
	suffix := 1
	for index := len(nums) - 1; index >= 0; index-- {
		result[index] *= suffix
		suffix *= nums[index]
	}
	return result
}

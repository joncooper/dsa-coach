package solution

func NextGreaterValues(nums []int) []int {
	result := make([]int, len(nums))
	for index := range result {
		result[index] = -1
	}
	stack := []int{}
	for index, num := range nums {
		for len(stack) > 0 && num > nums[stack[len(stack)-1]] {
			previous := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			result[previous] = num
		}
		stack = append(stack, index)
	}
	return result
}

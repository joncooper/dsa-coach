package solution

func ValidateStackSequence(pushed []int, popped []int) bool {
	stack := []int{}
	popIndex := 0
	for _, value := range pushed {
		stack = append(stack, value)
		for len(stack) > 0 && popIndex < len(popped) && stack[len(stack)-1] == popped[popIndex] {
			stack = stack[:len(stack)-1]
			popIndex++
		}
	}
	return popIndex == len(popped)
}

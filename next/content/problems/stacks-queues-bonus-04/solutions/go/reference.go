package solution

func ParenScore(text string) int {
	stack := []int{0}
	for _, char := range text {
		if char == '(' {
			stack = append(stack, 0)
		} else {
			inside := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			value := inside * 2
			if value < 1 {
				value = 1
			}
			stack[len(stack)-1] += value
		}
	}
	return stack[0]
}

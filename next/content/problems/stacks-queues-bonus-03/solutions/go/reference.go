package solution

func CollapseDuplicates(text string) string {
	stack := []rune{}
	for _, char := range text {
		if len(stack) > 0 && stack[len(stack)-1] == char {
			stack = stack[:len(stack)-1]
		} else {
			stack = append(stack, char)
		}
	}
	return string(stack)
}

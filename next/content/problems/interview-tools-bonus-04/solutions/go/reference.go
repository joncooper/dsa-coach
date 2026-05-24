package solution

func IsBalanced(text string) bool {
	pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}
	stack := []rune{}
	for _, ch := range text { if opener, ok := pairs[ch]; ok { if len(stack) == 0 || stack[len(stack)-1] != opener { return false }; stack = stack[:len(stack)-1] } else { stack = append(stack, ch) } }
	return len(stack) == 0
}

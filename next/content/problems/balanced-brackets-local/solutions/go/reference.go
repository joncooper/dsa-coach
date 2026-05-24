package solution

func BalancedBracketsLocal(text string) bool {
	pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}
	openers := map[rune]bool{'(': true, '[': true, '{': true}
	stack := []rune{}
	for _, char := range text {
		if openers[char] {
			stack = append(stack, char)
		} else if opener, ok := pairs[char]; ok {
			if len(stack) == 0 || stack[len(stack)-1] != opener {
				return false
			}
			stack = stack[:len(stack)-1]
		}
	}
	return len(stack) == 0
}

package solution

func IsomorphicStrings(source string, target string) bool {
	leftChars := []rune(source)
	rightChars := []rune(target)
	if len(leftChars) != len(rightChars) {
		return false
	}
	forward := map[rune]rune{}
	used := map[rune]bool{}
	for index, left := range leftChars {
		right := rightChars[index]
		if mapped, ok := forward[left]; ok {
			if mapped != right {
				return false
			}
		} else {
			if used[right] {
				return false
			}
			forward[left] = right
			used[right] = true
		}
	}
	return true
}

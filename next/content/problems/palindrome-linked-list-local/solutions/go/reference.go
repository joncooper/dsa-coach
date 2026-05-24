package solution

func PalindromeLinkedListLocal(values []int) bool {
	left := 0
	right := len(values) - 1
	for left < right {
		if values[left] != values[right] {
			return false
		}
		left++
		right--
	}
	return true
}

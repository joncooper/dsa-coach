package solution

import (
	"unicode"
)

func IsLoosePalindrome(text string) bool {
	chars := []rune(text)
	left := 0
	right := len(chars) - 1
	for left < right {
		for left < right && !unicode.IsLetter(chars[left]) && !unicode.IsDigit(chars[left]) {
			left++
		}
		for left < right && !unicode.IsLetter(chars[right]) && !unicode.IsDigit(chars[right]) {
			right--
		}
		if unicode.ToLower(chars[left]) != unicode.ToLower(chars[right]) {
			return false
		}
		left++
		right--
	}
	return true
}

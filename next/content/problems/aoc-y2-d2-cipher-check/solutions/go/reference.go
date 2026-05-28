package solution

import (
	"strings"
	"unicode"
)

func ValidCipherCount(inputText string) int {
	valid := 0
	for _, raw := range strings.Split(inputText, "\n") {
		parts := strings.Fields(raw)
		if len(parts) != 3 {
			continue
		}
		if parts[2] == "ok" && hasLetter(parts[1]) && hasDigit(parts[1]) {
			valid++
		}
	}
	return valid
}
func hasLetter(text string) bool {
	for _, ch := range text {
		if unicode.IsLetter(ch) {
			return true
		}
	}
	return false
}
func hasDigit(text string) bool {
	for _, ch := range text {
		if unicode.IsDigit(ch) {
			return true
		}
	}
	return false
}

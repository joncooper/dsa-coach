package solution

import "strings"

func CountVowels(text string) int {
	vowels := map[rune]bool{'a': true, 'e': true, 'i': true, 'o': true, 'u': true}
	count := 0
	for _, char := range strings.ToLower(text) {
		if vowels[char] {
			count++
		}
	}
	return count
}

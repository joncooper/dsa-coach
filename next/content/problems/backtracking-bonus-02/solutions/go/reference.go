package solution

import "sort"

func LetterCaseCombinations(text string) []string {
	result := []string{}
	chars := []rune{}
	var backtrack func(int)
	backtrack = func(index int) {
		if index == len([]rune(text)) {
			result = append(result, string(chars))
			return
		}
		runes := []rune(text)
		ch := runes[index]
		if isAsciiLetter(ch) {
			chars = append(chars, toLowerAscii(ch))
			backtrack(index + 1)
			chars = chars[:len(chars)-1]
			chars = append(chars, toUpperAscii(ch))
			backtrack(index + 1)
			chars = chars[:len(chars)-1]
		} else {
			chars = append(chars, ch)
			backtrack(index + 1)
			chars = chars[:len(chars)-1]
		}
	}
	backtrack(0)
	sort.Strings(result)
	return result
}

func isAsciiLetter(ch rune) bool { return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') }
func toLowerAscii(ch rune) rune {
	if ch >= 'A' && ch <= 'Z' {
		return ch + 32
	}
	return ch
}
func toUpperAscii(ch rune) rune {
	if ch >= 'a' && ch <= 'z' {
		return ch - 32
	}
	return ch
}

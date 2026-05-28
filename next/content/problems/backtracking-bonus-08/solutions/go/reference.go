package solution

import "sort"

func KeypadLetterWords(digits string) []string {
	mapping := map[byte]string{'2': "abc", '3': "def", '4': "ghi", '5': "jkl", '6': "mno", '7': "pqrs", '8': "tuv", '9': "wxyz"}
	if len(digits) == 0 {
		return []string{}
	}
	for index := 0; index < len(digits); index++ {
		if _, ok := mapping[digits[index]]; !ok {
			return []string{}
		}
	}
	result := []string{}
	letters := []byte{}
	var backtrack func(int)
	backtrack = func(index int) {
		if index == len(digits) {
			result = append(result, string(letters))
			return
		}
		for _, letter := range []byte(mapping[digits[index]]) {
			letters = append(letters, letter)
			backtrack(index + 1)
			letters = letters[:len(letters)-1]
		}
	}
	backtrack(0)
	sort.Strings(result)
	return result
}

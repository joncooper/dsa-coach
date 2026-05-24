package solution

func CanFormWord(word string, letters []string) bool {
	counts := map[rune]int{}
	for _, letter := range letters {
		chars := []rune(letter)
		if len(chars) > 0 {
			counts[chars[0]]++
		}
	}
	for _, char := range word {
		if counts[char] == 0 {
			return false
		}
		counts[char]--
	}
	return true
}

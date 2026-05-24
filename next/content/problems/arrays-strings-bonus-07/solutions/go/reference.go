package solution

func FirstUniqueIndex(text string) int {
	counts := map[rune]int{}
	chars := []rune(text)
	for _, char := range chars {
		counts[char]++
	}
	for index, char := range chars {
		if counts[char] == 1 {
			return index
		}
	}
	return -1
}

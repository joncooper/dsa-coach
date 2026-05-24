package solution

func MostFrequentCharacter(text string) *string {
	if len(text) == 0 {
		return nil
	}
	counts := map[rune]int{}
	chars := []rune(text)
	for _, char := range chars {
		counts[char]++
	}
	best := chars[0]
	for _, char := range chars {
		if counts[char] > counts[best] {
			best = char
		}
	}
	result := string(best)
	return &result
}

package solution

func CharFrequencyTable(text string) map[string]int {
	counts := map[string]int{}
	for _, char := range text {
		counts[string(char)]++
	}
	return counts
}

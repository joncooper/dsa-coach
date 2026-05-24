package solution

func DecodeString(text string) string {
	counts := []int{}
	pieces := []string{}
	current := ""
	count := 0
	for _, char := range text {
		if char >= '0' && char <= '9' {
			count = count*10 + int(char-'0')
		} else if char == '[' {
			counts = append(counts, count)
			pieces = append(pieces, current)
			current = ""
			count = 0
		} else if char == ']' {
			repeat := counts[len(counts)-1]
			counts = counts[:len(counts)-1]
			prefix := pieces[len(pieces)-1]
			pieces = pieces[:len(pieces)-1]
			current = prefix + repeatString(current, repeat)
		} else {
			current += string(char)
		}
	}
	return current
}

func repeatString(value string, count int) string {
	result := ""
	for index := 0; index < count; index++ {
		result += value
	}
	return result
}

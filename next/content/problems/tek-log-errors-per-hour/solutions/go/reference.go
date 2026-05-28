package solution

func ErrorsPerHour(lines []string) map[string]int {
	counts := map[string]int{}
	for _, line := range lines {
		timestamp, rest, ok := cut(line, ' ')
		if !ok {
			continue
		}
		level, _, _ := cut(rest, ' ')
		if level == "ERROR" && len(timestamp) >= 13 && timestamp[10] == 'T' {
			counts[timestamp[:13]]++
		}
	}
	return counts
}
func cut(text string, sep byte) (string, string, bool) {
	for i := 0; i < len(text); i++ {
		if text[i] == sep {
			return text[:i], text[i+1:], true
		}
	}
	return text, "", false
}

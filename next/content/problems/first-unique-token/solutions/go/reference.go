package solution

func FirstUniqueToken(tokens []string) string {
	counts := map[string]int{}
	for _, token := range tokens {
		counts[token]++
	}
	for _, token := range tokens {
		if counts[token] == 1 {
			return token
		}
	}
	return ""
}

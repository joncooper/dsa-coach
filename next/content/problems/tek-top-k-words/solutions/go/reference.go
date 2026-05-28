package solution

import (
	"regexp"
	"sort"
	"strings"
)

func TopKWords(text string, k int) [][]any {
	if k <= 0 {
		return [][]any{}
	}
	pattern := regexp.MustCompile("[a-z]+")
	counts := map[string]int{}
	for _, word := range pattern.FindAllString(strings.ToLower(text), -1) {
		counts[word]++
	}
	words := make([]string, 0, len(counts))
	for word := range counts {
		words = append(words, word)
	}
	sort.Slice(words, func(i, j int) bool {
		if counts[words[i]] != counts[words[j]] {
			return counts[words[i]] > counts[words[j]]
		}
		return words[i] < words[j]
	})
	if k > len(words) {
		k = len(words)
	}
	out := make([][]any, 0, k)
	for _, word := range words[:k] {
		out = append(out, []any{word, counts[word]})
	}
	return out
}

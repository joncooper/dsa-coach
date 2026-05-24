package solution

import (
	"sort"
)

func GroupByFirstLetter(words []string) map[string][]string {
	groups := map[string][]string{}
	for _, word := range words {
		if len(word) == 0 {
			continue
		}
		key := string([]rune(word)[0])
		groups[key] = append(groups[key], word)
	}
	keys := []string{}
	for key := range groups {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	ordered := map[string][]string{}
	for _, key := range keys {
		ordered[key] = groups[key]
	}
	return ordered
}

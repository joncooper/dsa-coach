package solution

import (
	"sort"
	"strings"
)

func AnagramBucketSizes(words []string) []int {
	buckets := map[string]int{}
	for _, word := range words {
		letters := strings.Split(word, "")
		sort.Strings(letters)
		key := strings.Join(letters, "")
		buckets[key]++
	}
	sizes := []int{}
	for _, size := range buckets {
		sizes = append(sizes, size)
	}
	sort.Ints(sizes)
	return sizes
}

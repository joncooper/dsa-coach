package solution

import "sort"

func UniqueTileSequenceCount(tiles string) int {
	counts := map[rune]int{}
	for _, tile := range tiles {
		counts[tile]++
	}
	letters := []rune{}
	for letter := range counts {
		letters = append(letters, letter)
	}
	sort.Slice(letters, func(i int, j int) bool { return letters[i] < letters[j] })
	var dfs func() int
	dfs = func() int {
		total := 0
		for _, letter := range letters {
			if counts[letter] == 0 {
				continue
			}
			counts[letter]--
			total += 1 + dfs()
			counts[letter]++
		}
		return total
	}
	return dfs()
}

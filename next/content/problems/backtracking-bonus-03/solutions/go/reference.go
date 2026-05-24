package solution

import "sort"

func DistinctPermutations(nums []int) [][]int {
	ordered := append([]int{}, nums...)
	sort.Ints(ordered)
	result := [][]int{}
	used := make([]bool, len(ordered))
	current := []int{}
	var backtrack func()
	backtrack = func() {
		if len(current) == len(ordered) { result = append(result, append([]int{}, current...)); return }
		for index := 0; index < len(ordered); index++ {
			if used[index] { continue }
			if index > 0 && ordered[index] == ordered[index-1] && !used[index-1] { continue }
			used[index] = true; current = append(current, ordered[index]); backtrack(); current = current[:len(current)-1]; used[index] = false
		}
	}
	backtrack()
	return result
}

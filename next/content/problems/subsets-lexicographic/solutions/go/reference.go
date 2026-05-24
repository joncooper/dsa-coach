package solution

import "sort"

func SubsetsLexicographic(nums []int) [][]int {
	ordered := append([]int{}, nums...)
	sort.Ints(ordered)
	result := [][]int{}
	path := []int{}
	var backtrack func(int)
	backtrack = func(start int) {
		copyPath := append([]int{}, path...)
		result = append(result, copyPath)
		for index := start; index < len(ordered); index++ {
			path = append(path, ordered[index])
			backtrack(index + 1)
			path = path[:len(path)-1]
		}
	}
	backtrack(0)
	return result
}

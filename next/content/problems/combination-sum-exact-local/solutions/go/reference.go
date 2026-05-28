package solution

import "sort"

func CombinationSumExactLocal(nums []int, target int) [][]int {
	ordered := append([]int{}, nums...)
	sort.Ints(ordered)
	result := [][]int{}
	path := []int{}
	var backtrack func(int, int)
	backtrack = func(start int, remaining int) {
		if remaining == 0 {
			result = append(result, append([]int{}, path...))
			return
		}
		previousSet := false
		previous := 0
		for index := start; index < len(ordered); index++ {
			value := ordered[index]
			if previousSet && value == previous {
				continue
			}
			if value > remaining {
				break
			}
			path = append(path, value)
			backtrack(index+1, remaining-value)
			path = path[:len(path)-1]
			previousSet = true
			previous = value
		}
	}
	backtrack(0, target)
	return result
}

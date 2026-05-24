package solution

import "sort"

func SubsetsOfSize(nums []int, k int) [][]int {
	result := [][]int{}
	chosen := []int{}
	var backtrack func(int)
	backtrack = func(start int) {
		if len(chosen) == k { result = append(result, append([]int{}, chosen...)); return }
		for index := start; index < len(nums); index++ { chosen = append(chosen, nums[index]); backtrack(index+1); chosen = chosen[:len(chosen)-1] }
	}
	if k >= 0 && k <= len(nums) { backtrack(0) }
	sort.Slice(result, func(i int, j int) bool { return compareIntSlices(result[i], result[j]) < 0 })
	return result
}

func compareIntSlices(left []int, right []int) int {
	limit := len(left)
	if len(right) < limit { limit = len(right) }
	for index := 0; index < limit; index++ {
		if left[index] < right[index] { return -1 }
		if left[index] > right[index] { return 1 }
	}
	if len(left) < len(right) { return -1 }
	if len(left) > len(right) { return 1 }
	return 0
}

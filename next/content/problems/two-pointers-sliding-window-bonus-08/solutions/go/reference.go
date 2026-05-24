package solution

import (
	"sort"
)

func CountPairsBelow(nums []int, threshold int) int {
	values := append([]int{}, nums...)
	sort.Ints(values)
	left := 0
	right := len(values) - 1
	count := 0
	for left < right {
		if values[left]+values[right] < threshold {
			count += right - left
			left++
		} else {
			right--
		}
	}
	return count
}

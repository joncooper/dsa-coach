package solution

import "sort"

func CanPartitionKSubsets(nums []int, k int) bool {
	total := 0
	for _, num := range nums { total += num }
	if k <= 0 || total%k != 0 { return false }
	target := total / k
	ordered := append([]int{}, nums...)
	sort.Sort(sort.Reverse(sort.IntSlice(ordered)))
	if len(ordered) > 0 && ordered[0] > target { return false }
	buckets := make([]int, k)
	var backtrack func(int) bool
	backtrack = func(index int) bool {
		if index == len(ordered) { return true }
		seen := map[int]bool{}
		for bucket := 0; bucket < k; bucket++ {
			if seen[buckets[bucket]] { continue }
			if buckets[bucket] + ordered[index] <= target { seen[buckets[bucket]] = true; buckets[bucket] += ordered[index]; if backtrack(index+1) { return true }; buckets[bucket] -= ordered[index] }
			if buckets[bucket] == 0 { break }
		}
		return false
	}
	return backtrack(0)
}

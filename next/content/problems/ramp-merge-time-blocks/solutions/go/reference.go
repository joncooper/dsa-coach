package solution

import "sort"

func MergeTimeBlocks(blocks [][]int) [][]int {
	ordered := copyBlocks(blocks)
	sort.Slice(ordered, func(i, j int) bool {
		if ordered[i][0] == ordered[j][0] {
			return ordered[i][1] < ordered[j][1]
		}
		return ordered[i][0] < ordered[j][0]
	})

	merged := [][]int{}
	for _, block := range ordered {
		start, end := block[0], block[1]
		if len(merged) == 0 || start > merged[len(merged)-1][1] {
			merged = append(merged, []int{start, end})
			continue
		}
		last := merged[len(merged)-1]
		if end > last[1] {
			last[1] = end
		}
	}

	return merged
}

func copyBlocks(blocks [][]int) [][]int {
	copied := make([][]int, len(blocks))
	for i, block := range blocks {
		copied[i] = []int{block[0], block[1]}
	}
	return copied
}

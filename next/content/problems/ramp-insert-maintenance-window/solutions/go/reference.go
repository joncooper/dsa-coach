package solution

import "sort"

func InsertMaintenanceWindow(blocks [][]int, newBlock []int) [][]int {
	ordered := make([][]int, 0, len(blocks)+1)
	for _, block := range blocks {
		ordered = append(ordered, []int{block[0], block[1]})
	}
	ordered = append(ordered, []int{newBlock[0], newBlock[1]})

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

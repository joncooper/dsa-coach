package solution

import "container/heap"

type rowEntry struct {
	strength int
	index    int
}

type rowHeap []rowEntry

func (h rowHeap) Len() int      { return len(h) }
func (h rowHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h rowHeap) Less(i, j int) bool {
	if h[i].strength != h[j].strength {
		return h[i].strength < h[j].strength
	}
	return h[i].index < h[j].index
}
func (h *rowHeap) Push(x any) { *h = append(*h, x.(rowEntry)) }
func (h *rowHeap) Pop() any {
	old := *h
	value := old[len(old)-1]
	*h = old[:len(old)-1]
	return value
}

func KWeakestRows(grid [][]int, k int) []int {
	pq := &rowHeap{}
	heap.Init(pq)
	for index, row := range grid {
		strength := 0
		for _, value := range row {
			strength += value
		}
		heap.Push(pq, rowEntry{strength: strength, index: index})
	}
	limit := k
	if limit > len(grid) {
		limit = len(grid)
	}
	result := []int{}
	for count := 0; count < limit; count++ {
		result = append(result, heap.Pop(pq).(rowEntry).index)
	}
	return result
}

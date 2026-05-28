package solution

import (
	"container/heap"
	"sort"
)

func TopKScores(scores []int, k int) []int {
	if k <= 0 || len(scores) == 0 {
		return []int{}
	}
	limit := k
	if limit > len(scores) {
		limit = len(scores)
	}
	pq := &intHeap{less: func(a int, b int) bool { return a < b }}
	heap.Init(pq)
	for _, score := range scores {
		if pq.Len() < limit {
			heap.Push(pq, score)
		} else if score > pq.Peek() {
			heap.Pop(pq)
			heap.Push(pq, score)
		}
	}
	result := append([]int{}, pq.values...)
	sort.Sort(sort.Reverse(sort.IntSlice(result)))
	return result
}

type intHeap struct {
	values []int
	less   func(a int, b int) bool
}

func (h intHeap) Len() int           { return len(h.values) }
func (h intHeap) Less(i, j int) bool { return h.less(h.values[i], h.values[j]) }
func (h intHeap) Swap(i, j int)      { h.values[i], h.values[j] = h.values[j], h.values[i] }

func (h *intHeap) Push(x any) {
	h.values = append(h.values, x.(int))
}

func (h *intHeap) Pop() any {
	old := h.values
	value := old[len(old)-1]
	h.values = old[:len(old)-1]
	return value
}

func (h *intHeap) Peek() int {
	return h.values[0]
}

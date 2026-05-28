package solution

import "container/heap"

func Heapsort(nums []int) []int {
	pq := &intHeap{less: func(a int, b int) bool { return a < b }}
	heap.Init(pq)
	for _, num := range nums {
		heap.Push(pq, num)
	}
	sorted := []int{}
	for pq.Len() > 0 {
		sorted = append(sorted, heap.Pop(pq).(int))
	}
	return sorted
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

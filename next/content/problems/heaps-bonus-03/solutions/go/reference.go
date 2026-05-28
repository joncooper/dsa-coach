package solution

import "container/heap"

func LastStoneWeight(stones []int) int {
	pq := &intHeap{less: func(a int, b int) bool { return a > b }}
	heap.Init(pq)
	for _, stone := range stones {
		heap.Push(pq, stone)
	}
	for pq.Len() > 1 {
		y := heap.Pop(pq).(int)
		x := heap.Pop(pq).(int)
		if x != y {
			heap.Push(pq, y-x)
		}
	}
	if pq.Len() == 0 {
		return 0
	}
	return heap.Pop(pq).(int)
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

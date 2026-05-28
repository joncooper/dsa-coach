package solution

import "container/heap"

func CombineUntilTarget(values []int, target int) int {
	pq := &intHeap{less: func(a int, b int) bool { return a < b }}
	heap.Init(pq)
	for _, value := range values {
		heap.Push(pq, value)
	}
	combines := 0
	for pq.Len() > 0 && pq.Peek() < target {
		if pq.Len() < 2 {
			return -1
		}
		small := heap.Pop(pq).(int)
		large := heap.Pop(pq).(int)
		heap.Push(pq, small+2*large)
		combines++
	}
	if pq.Len() == 0 {
		return -1
	}
	return combines
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

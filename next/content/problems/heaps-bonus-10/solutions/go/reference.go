package solution

import "container/heap"

func MaxScoreAfterHalving(nums []int, k int) int {
	pq := &intHeap{less: func(a int, b int) bool { return a > b }}
	heap.Init(pq)
	total := 0
	for _, num := range nums {
		total += num
		heap.Push(pq, num)
	}
	for count := 0; count < k && pq.Len() > 0; count++ {
		value := heap.Pop(pq).(int)
		if value <= 1 {
			heap.Push(pq, value)
			break
		}
		reduced := (value + 1) / 2
		total -= value - reduced
		heap.Push(pq, reduced)
	}
	return total
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

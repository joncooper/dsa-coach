package solution

import "container/heap"

func RunningMediansLocal(nums []int) []float64 {
	lower := &intHeap{less: func(a int, b int) bool { return a > b }}
	upper := &intHeap{less: func(a int, b int) bool { return a < b }}
	heap.Init(lower)
	heap.Init(upper)
	medians := []float64{}
	for _, num := range nums {
		if lower.Len() == 0 || num <= lower.Peek() {
			heap.Push(lower, num)
		} else {
			heap.Push(upper, num)
		}
		if lower.Len() > upper.Len()+1 {
			heap.Push(upper, heap.Pop(lower).(int))
		} else if upper.Len() > lower.Len() {
			heap.Push(lower, heap.Pop(upper).(int))
		}
		if (lower.Len()+upper.Len())%2 == 1 {
			medians = append(medians, float64(lower.Peek()))
		} else {
			medians = append(medians, float64(lower.Peek()+upper.Peek())/2.0)
		}
	}
	return medians
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

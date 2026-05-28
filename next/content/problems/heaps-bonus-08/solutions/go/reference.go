package solution

import "container/heap"

type jobEntry struct {
	priority int
	id       int
}

type jobHeap []jobEntry

func (h jobHeap) Len() int      { return len(h) }
func (h jobHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h jobHeap) Less(i, j int) bool {
	if h[i].priority != h[j].priority {
		return h[i].priority > h[j].priority
	}
	return h[i].id < h[j].id
}
func (h *jobHeap) Push(x any) { *h = append(*h, x.(jobEntry)) }
func (h *jobHeap) Pop() any {
	old := *h
	value := old[len(old)-1]
	*h = old[:len(old)-1]
	return value
}

func PrintOrder(jobs [][]int) []int {
	pq := &jobHeap{}
	heap.Init(pq)
	for _, job := range jobs {
		heap.Push(pq, jobEntry{priority: job[0], id: job[1]})
	}
	order := []int{}
	for pq.Len() > 0 {
		order = append(order, heap.Pop(pq).(jobEntry).id)
	}
	return order
}

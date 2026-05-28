package solution

import "container/heap"

type pairEntry struct {
	sum int
	i   int
	j   int
}

type pairHeap []pairEntry

func (h pairHeap) Len() int      { return len(h) }
func (h pairHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h pairHeap) Less(i, j int) bool {
	if h[i].sum != h[j].sum {
		return h[i].sum < h[j].sum
	}
	if h[i].i != h[j].i {
		return h[i].i < h[j].i
	}
	return h[i].j < h[j].j
}
func (h *pairHeap) Push(x any) { *h = append(*h, x.(pairEntry)) }
func (h *pairHeap) Pop() any {
	old := *h
	value := old[len(old)-1]
	*h = old[:len(old)-1]
	return value
}

func KthSmallestPairSum(a []int, b []int, k int) int {
	if len(a) == 0 || len(b) == 0 || k <= 0 {
		return 0
	}
	pq := &pairHeap{}
	heap.Init(pq)
	limit := k
	if limit > len(b) {
		limit = len(b)
	}
	for j := 0; j < limit; j++ {
		heap.Push(pq, pairEntry{sum: a[0] + b[j], i: 0, j: j})
	}
	current := 0
	for count := 0; count < k && pq.Len() > 0; count++ {
		next := heap.Pop(pq).(pairEntry)
		current = next.sum
		if next.i+1 < len(a) {
			next.i++
			next.sum = a[next.i] + b[next.j]
			heap.Push(pq, next)
		}
	}
	return current
}

package solution

import (
	"container/heap"
	"sort"
)

type closeEntry struct {
	distance int
	value    int
}

type closeHeap []closeEntry

func (h closeHeap) Len() int      { return len(h) }
func (h closeHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h closeHeap) Less(i, j int) bool {
	if h[i].distance != h[j].distance {
		return h[i].distance < h[j].distance
	}
	return h[i].value < h[j].value
}
func (h *closeHeap) Push(x any) { *h = append(*h, x.(closeEntry)) }
func (h *closeHeap) Pop() any {
	old := *h
	value := old[len(old)-1]
	*h = old[:len(old)-1]
	return value
}

func KClosestNumbers(nums []int, target int, k int) []int {
	pq := &closeHeap{}
	heap.Init(pq)
	for _, num := range nums {
		heap.Push(pq, closeEntry{distance: abs(num - target), value: num})
	}
	limit := k
	if limit > len(nums) {
		limit = len(nums)
	}
	result := []int{}
	for count := 0; count < limit; count++ {
		result = append(result, heap.Pop(pq).(closeEntry).value)
	}
	sort.Ints(result)
	return result
}

func abs(value int) int {
	if value < 0 {
		return -value
	}
	return value
}

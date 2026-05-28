package solution

import (
	"container/heap"
	"sort"
)

type freqEntry struct {
	num   int
	count int
}

type freqHeap []freqEntry

func (h freqHeap) Len() int      { return len(h) }
func (h freqHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h freqHeap) Less(i, j int) bool {
	if h[i].count != h[j].count {
		return h[i].count > h[j].count
	}
	return h[i].num < h[j].num
}
func (h *freqHeap) Push(x any) { *h = append(*h, x.(freqEntry)) }
func (h *freqHeap) Pop() any {
	old := *h
	value := old[len(old)-1]
	*h = old[:len(old)-1]
	return value
}

func TopKFrequent(nums []int, k int) []int {
	counts := map[int]int{}
	for _, num := range nums {
		counts[num]++
	}
	pq := &freqHeap{}
	heap.Init(pq)
	for num, count := range counts {
		heap.Push(pq, freqEntry{num: num, count: count})
	}
	limit := k
	if limit > len(counts) {
		limit = len(counts)
	}
	result := []int{}
	for index := 0; index < limit; index++ {
		result = append(result, heap.Pop(pq).(freqEntry).num)
	}
	sort.Ints(result)
	return result
}

package solution

import "container/heap"

type batchEntry struct {
	value int
	batch int
	index int
}

type batchHeap []batchEntry

func (h batchHeap) Len() int      { return len(h) }
func (h batchHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h batchHeap) Less(i, j int) bool {
	if h[i].value != h[j].value {
		return h[i].value < h[j].value
	}
	if h[i].batch != h[j].batch {
		return h[i].batch < h[j].batch
	}
	return h[i].index < h[j].index
}
func (h *batchHeap) Push(x any) { *h = append(*h, x.(batchEntry)) }
func (h *batchHeap) Pop() any {
	old := *h
	value := old[len(old)-1]
	*h = old[:len(old)-1]
	return value
}

func MergeSortedBatches(batches [][]int) []int {
	pq := &batchHeap{}
	heap.Init(pq)
	for batchIndex, batch := range batches {
		if len(batch) > 0 {
			heap.Push(pq, batchEntry{value: batch[0], batch: batchIndex, index: 0})
		}
	}
	merged := []int{}
	for pq.Len() > 0 {
		next := heap.Pop(pq).(batchEntry)
		merged = append(merged, next.value)
		next.index++
		if next.index < len(batches[next.batch]) {
			next.value = batches[next.batch][next.index]
			heap.Push(pq, next)
		}
	}
	return merged
}

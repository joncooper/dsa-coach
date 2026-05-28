package solution

import "container/heap"

type pointEntry struct {
	distance int
	x        int
	y        int
	point    []int
}

type pointHeap []pointEntry

func (h pointHeap) Len() int      { return len(h) }
func (h pointHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h pointHeap) Less(i, j int) bool {
	if h[i].distance != h[j].distance {
		return h[i].distance < h[j].distance
	}
	if h[i].x != h[j].x {
		return h[i].x < h[j].x
	}
	return h[i].y < h[j].y
}
func (h *pointHeap) Push(x any) { *h = append(*h, x.(pointEntry)) }
func (h *pointHeap) Pop() any {
	old := *h
	value := old[len(old)-1]
	*h = old[:len(old)-1]
	return value
}

func KClosestPointsLocal(points [][]int, k int) [][]int {
	pq := &pointHeap{}
	heap.Init(pq)
	for _, point := range points {
		x, y := point[0], point[1]
		heap.Push(pq, pointEntry{distance: x*x + y*y, x: x, y: y, point: point})
	}
	limit := k
	if limit > len(points) {
		limit = len(points)
	}
	result := [][]int{}
	for count := 0; count < limit; count++ {
		result = append(result, heap.Pop(pq).(pointEntry).point)
	}
	return result
}

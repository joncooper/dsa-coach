package solution

func ShortestEdgePath(n int, edges [][]int, start int, goal int) int {
	if start == goal {
		return 0
	}
	graph := make([][]int, n)
	for _, edge := range edges {
		u, v := edge[0], edge[1]
		graph[u] = append(graph[u], v)
		graph[v] = append(graph[v], u)
	}
	queue := [][]int{{start, 0}}
	seen := map[int]bool{start: true}
	for index := 0; index < len(queue); index++ {
		node, distance := queue[index][0], queue[index][1]
		for _, neighbor := range graph[node] {
			if neighbor == goal {
				return distance + 1
			}
			if !seen[neighbor] {
				seen[neighbor] = true
				queue = append(queue, []int{neighbor, distance + 1})
			}
		}
	}
	return -1
}

package solution

func ConnectedComponentCount(n int, edges [][]int) int {
	graph := make([][]int, n)
	for _, edge := range edges {
		u, v := edge[0], edge[1]
		if u == v { continue }
		graph[u] = append(graph[u], v)
		graph[v] = append(graph[v], u)
	}
	seen := map[int]bool{}
	components := 0
	for node := 0; node < n; node++ {
		if seen[node] { continue }
		components++
		stack := []int{node}
		seen[node] = true
		for len(stack) > 0 {
			current := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			for _, neighbor := range graph[current] {
				if !seen[neighbor] { seen[neighbor] = true; stack = append(stack, neighbor) }
			}
		}
	}
	return components
}

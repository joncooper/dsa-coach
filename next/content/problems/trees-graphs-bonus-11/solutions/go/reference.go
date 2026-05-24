package solution

func CountReachable(graph map[string][]string, source string) int {
	seen := map[string]bool{source: true}
	queue := []string{source}
	for index := 0; index < len(queue); index++ {
		node := queue[index]
		for _, neighbor := range graph[node] {
			if !seen[neighbor] { seen[neighbor] = true; queue = append(queue, neighbor) }
		}
	}
	return len(seen)
}

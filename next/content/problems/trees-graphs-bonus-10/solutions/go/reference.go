package solution

func HasRoute(graph map[string][]string, source string, target string) bool {
	if source == target { return true }
	seen := map[string]bool{source: true}
	stack := []string{source}
	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		for _, neighbor := range graph[node] {
			if neighbor == target { return true }
			if !seen[neighbor] { seen[neighbor] = true; stack = append(stack, neighbor) }
		}
	}
	return false
}

package solution

func HasCycle(graph map[string][]string) bool {
	visiting := map[string]bool{}
	visited := map[string]bool{}
	var dfs func(string) bool
	dfs = func(node string) bool {
		if visiting[node] { return true }
		if visited[node] { return false }
		visiting[node] = true
		for _, neighbor := range graph[node] { if dfs(neighbor) { return true } }
		delete(visiting, node)
		visited[node] = true
		return false
	}
	for node := range graph { if dfs(node) { return true } }
	return false
}

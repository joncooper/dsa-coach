package solution

import "sort"

func TaskOrder(deps map[string]any) []string {
	adj := map[string][]string{}
	indegree := map[string]int{}
	ensure := func(task string) {
		if _, ok := adj[task]; !ok {
			adj[task] = []string{}
		}
		if _, ok := indegree[task]; !ok {
			indegree[task] = 0
		}
	}
	for task, rawPrereqs := range deps {
		ensure(task)
		for _, prereq := range asStringSlice(rawPrereqs) {
			ensure(prereq)
			adj[prereq] = append(adj[prereq], task)
			indegree[task]++
		}
	}
	ready := []string{}
	for task, degree := range indegree {
		if degree == 0 {
			ready = append(ready, task)
		}
	}
	sort.Strings(ready)
	order := []string{}
	for len(ready) > 0 {
		task := ready[0]
		ready = ready[1:]
		order = append(order, task)
		for _, next := range adj[task] {
			indegree[next]--
			if indegree[next] == 0 {
				ready = append(ready, next)
				sort.Strings(ready)
			}
		}
	}
	if len(order) != len(indegree) {
		return nil
	}
	return order
}
func asStringSlice(value any) []string {
	switch v := value.(type) {
	case []string:
		return v
	case []any:
		out := make([]string, 0, len(v))
		for _, item := range v {
			if s, ok := item.(string); ok {
				out = append(out, s)
			}
		}
		return out
	default:
		return nil
	}
}

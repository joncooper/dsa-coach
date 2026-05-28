package solution

import "strings"

func ScheduleFinish(inputText string) int {
	children, nodes := parseTasks(inputText)
	if len(nodes) == 0 {
		return 0
	}
	parents := map[string]map[string]bool{}
	for node := range nodes {
		parents[node] = map[string]bool{}
	}
	for parent, kids := range children {
		for _, kid := range kids {
			parents[kid][parent] = true
		}
	}
	start := map[string]int{}
	var resolve func(string) int
	resolve = func(node string) int {
		if value, ok := start[node]; ok {
			return value
		}
		best := -1
		for parent := range parents[node] {
			if value := resolve(parent); value > best {
				best = value
			}
		}
		if best < 0 {
			start[node] = 0
		} else {
			start[node] = best + 1
		}
		return start[node]
	}
	best := 0
	for node := range nodes {
		if value := resolve(node); value > best {
			best = value
		}
	}
	return best + 1
}
func parseTasks(inputText string) (map[string][]string, map[string]bool) {
	children := map[string][]string{}
	nodes := map[string]bool{}
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if !strings.HasSuffix(line, ".") || !strings.Contains(line, " before ") {
			continue
		}
		parts := strings.SplitN(strings.TrimSuffix(line, "."), " before ", 2)
		head := strings.TrimSpace(parts[0])
		nodes[head] = true
		if strings.TrimSpace(parts[1]) == "nothing" {
			if _, ok := children[head]; !ok {
				children[head] = []string{}
			}
			continue
		}
		kids := []string{}
		for _, token := range strings.Split(parts[1], ",") {
			kid := strings.TrimSpace(token)
			if kid != "" {
				kids = append(kids, kid)
				nodes[kid] = true
				if _, ok := children[kid]; !ok {
					children[kid] = []string{}
				}
			}
		}
		children[head] = append(children[head], kids...)
	}
	return children, nodes
}

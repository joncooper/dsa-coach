package solution

import "strings"

func LongestChain(inputText string) int {
	children, nodes := parseTasks(inputText)
	if len(nodes) == 0 {
		return 0
	}
	memo := map[string]int{}
	var depth func(string) int
	depth = func(node string) int {
		if value, ok := memo[node]; ok {
			return value
		}
		kids := children[node]
		if len(kids) == 0 {
			memo[node] = 1
			return 1
		}
		best := 0
		for _, kid := range kids {
			if d := depth(kid); d > best {
				best = d
			}
		}
		memo[node] = 1 + best
		return memo[node]
	}
	best := 0
	for node := range nodes {
		if d := depth(node); d > best {
			best = d
		}
	}
	return best
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

package solution

import (
	"regexp"
	"strconv"
	"strings"
)

func CountContainersHoldingGold(inputText string) int {
	contains := parseContainers(inputText)
	parents := map[string][]string{}
	for parent, children := range contains {
		for _, child := range children {
			parents[child.name] = append(parents[child.name], parent)
		}
	}
	visited := map[string]bool{}
	stack := append([]string{}, parents["bright gold"]...)
	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if visited[node] {
			continue
		}
		visited[node] = true
		stack = append(stack, parents[node]...)
	}
	return len(visited)
}

type child struct {
	count int
	name  string
}

func parseContainers(inputText string) map[string][]child {
	lineRE := regexp.MustCompile("^(\\w+ \\w+) containers hold (.+)\\.$")
	childRE := regexp.MustCompile("(\\d+) (\\w+ \\w+) containers?")
	contains := map[string][]child{}
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		m := lineRE.FindStringSubmatch(line)
		if m == nil {
			continue
		}
		kids := []child{}
		if m[2] != "no other containers" {
			for _, item := range childRE.FindAllStringSubmatch(m[2], -1) {
				n, _ := strconv.Atoi(item[1])
				kids = append(kids, child{n, item[2]})
			}
		}
		contains[m[1]] = kids
	}
	return contains
}

package solution

import (
	"regexp"
	"strings"
)

func CountDependentsOnPaste(inputText string) int {
	children := parseRecipes(inputText)
	parents := map[string][]string{}
	for parent, kids := range children {
		for _, kid := range kids {
			parents[kid.name] = append(parents[kid.name], parent)
		}
	}
	visited := map[string]bool{}
	stack := append([]string{}, parents["binding_paste"]...)
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

type ingredient struct {
	amount int
	name   string
}

func parseRecipes(inputText string) map[string][]ingredient {
	lineRE := regexp.MustCompile("^(\\w+) requires (.+)\\.$")
	ingRE := regexp.MustCompile("(\\d+) (\\w+)")
	children := map[string][]ingredient{}
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		m := lineRE.FindStringSubmatch(line)
		if m == nil {
			continue
		}
		kids := []ingredient{}
		if m[2] != "nothing" {
			for _, item := range ingRE.FindAllStringSubmatch(m[2], -1) {
				kids = append(kids, ingredient{atoi(item[1]), item[2]})
			}
		}
		children[m[1]] = kids
	}
	return children
}
func atoi(text string) int {
	n := 0
	for _, ch := range text {
		n = n*10 + int(ch-'0')
	}
	return n
}

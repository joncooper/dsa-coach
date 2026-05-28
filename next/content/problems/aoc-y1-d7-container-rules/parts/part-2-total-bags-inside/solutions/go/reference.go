package solution

import (
	"regexp"
	"strconv"
	"strings"
)

func TotalInsideGold(inputText string) int {
	contains := parseContainers(inputText)
	memo := map[string]int{}
	var total func(string) int
	total = func(node string) int {
		if value, ok := memo[node]; ok {
			return value
		}
		result := 0
		for _, child := range contains[node] {
			result += child.count + child.count*total(child.name)
		}
		memo[node] = result
		return result
	}
	return total("bright gold")
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

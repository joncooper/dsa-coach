package solution

import (
	"regexp"
	"strings"
)

func BindingPasteCost(inputText string) int {
	children := parseRecipes(inputText)
	if _, ok := children["final_product"]; !ok {
		return 0
	}
	memo := map[string]int{}
	var cost func(string) int
	cost = func(node string) int {
		if node == "binding_paste" {
			return 1
		}
		if value, ok := memo[node]; ok {
			return value
		}
		total := 0
		for _, child := range children[node] {
			total += child.amount * cost(child.name)
		}
		memo[node] = total
		return total
	}
	return cost("final_product")
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

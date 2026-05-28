package solution

import "strings"

func ChoosePatternLabel(features []string) string {
	lowered := []string{}
	for _, feature := range features {
		lowered = append(lowered, strings.ToLower(feature))
	}
	text := strings.Join(lowered, " ")
	groups := []struct {
		label   string
		needles []string
	}{{"graph", []string{"node", "edge", "shortest", "connected"}}, {"dp", []string{"subproblem", "reuse", "minimum", "optimal"}}, {"binary-search", []string{"sorted", "boundary", "answer"}}, {"sliding-window", []string{"contiguous", "window", "at most", "positive"}}}
	for _, group := range groups {
		for _, needle := range group.needles {
			if strings.Contains(text, needle) {
				return group.label
			}
		}
	}
	return "hashing"
}

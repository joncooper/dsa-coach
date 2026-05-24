package solution

func FirstUnique(stream []string) []string {
	counts := map[string]int{}
	pending := []string{}
	out := []string{}
	for _, value := range stream {
		counts[value]++
		if counts[value] == 1 {
			pending = append(pending, value)
		} else {
			pending = removeString(pending, value)
		}
		if len(pending) == 0 {
			out = append(out, "")
		} else {
			out = append(out, pending[0])
		}
	}
	return out
}

func removeString(values []string, target string) []string {
	out := values[:0]
	for _, value := range values {
		if value != target {
			out = append(out, value)
		}
	}
	return out
}

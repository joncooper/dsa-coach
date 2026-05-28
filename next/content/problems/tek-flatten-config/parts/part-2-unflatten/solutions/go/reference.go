package solution

import "strings"

func UnflattenConfig(flat map[string]any) map[string]any {
	root := map[string]any{}
	for path, value := range flat {
		segments := strings.Split(path, ".")
		node := root
		for _, segment := range segments[:len(segments)-1] {
			next, ok := node[segment].(map[string]any)
			if !ok {
				next = map[string]any{}
				node[segment] = next
			}
			node = next
		}
		node[segments[len(segments)-1]] = value
	}
	return root
}

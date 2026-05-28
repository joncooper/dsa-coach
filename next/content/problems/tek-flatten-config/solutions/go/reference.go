package solution

func FlattenConfig(config map[string]any) map[string]any {
	out := map[string]any{}
	var walk func(map[string]any, string)
	walk = func(node map[string]any, prefix string) {
		for key, value := range node {
			path := key
			if prefix != "" {
				path = prefix + "." + key
			}
			if child, ok := value.(map[string]any); ok {
				walk(child, path)
			} else {
				out[path] = value
			}
		}
	}
	walk(config, "")
	return out
}

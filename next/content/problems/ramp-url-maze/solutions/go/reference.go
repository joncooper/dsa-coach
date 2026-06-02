package solution

type page struct {
	kind     string
	payload  any
	failures int
}

func FindExitUrl(pages [][]any, start string, maxRetries int) string {
	byURL := map[string]page{}
	for _, row := range pages {
		byURL[asString(row[0])] = page{
			kind:     asString(row[1]),
			payload:  row[2],
			failures: asInt(row[3]),
		}
	}

	queue := []string{start}
	visited := map[string]bool{}
	attempts := map[string]int{}

	for len(queue) > 0 {
		url := queue[0]
		queue = queue[1:]
		if visited[url] {
			continue
		}

		page, ok := byURL[url]
		if !ok {
			continue
		}

		attempt := attempts[url]
		if attempt < page.failures {
			attempts[url] = attempt + 1
			if attempts[url] <= maxRetries {
				queue = append(queue, url)
			}
			continue
		}

		visited[url] = true
		if page.kind == "EXIT" {
			return url
		}
		if page.kind != "LINKS" {
			continue
		}

		for _, nextURL := range asAnySlice(page.payload) {
			child := asString(nextURL)
			if !visited[child] {
				queue = append(queue, child)
			}
		}
	}

	return ""
}

func asAnySlice(value any) []any {
	if items, ok := value.([]any); ok {
		return items
	}
	return []any{}
}

func asInt(value any) int {
	switch v := value.(type) {
	case int:
		return v
	case int64:
		return int(v)
	case float64:
		return int(v)
	default:
		return 0
	}
}

func asString(value any) string {
	if s, ok := value.(string); ok {
		return s
	}
	return ""
}

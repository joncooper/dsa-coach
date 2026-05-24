package solution

func LruCache(capacity int, operations [][]string) []string {
	cache := map[string]string{}
	order := []string{}
	out := []string{}
	for _, op := range operations {
		if len(op) == 0 {
			continue
		}
		if op[0] == "get" {
			key := op[1]
			value, ok := cache[key]
			if !ok {
				out = append(out, "-1")
			} else {
				order = removeKey(order, key)
				order = append(order, key)
				out = append(out, value)
			}
		} else {
			key := op[1]
			value := op[2]
			if _, ok := cache[key]; ok {
				order = removeKey(order, key)
			}
			cache[key] = value
			order = append(order, key)
			if len(order) > capacity {
				oldest := order[0]
				order = order[1:]
				delete(cache, oldest)
			}
		}
	}
	return out
}

func removeKey(values []string, target string) []string {
	out := values[:0]
	for _, value := range values {
		if value != target {
			out = append(out, value)
		}
	}
	return out
}

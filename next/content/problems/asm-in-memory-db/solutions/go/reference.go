package solution

func Solution(queries [][]string) []string {
	store := map[string]map[string]string{}
	out := []string{}

	deleteField := func(key, field string) bool {
		fields, exists := store[key]
		if !exists {
			return false
		}
		if _, exists := fields[field]; !exists {
			return false
		}
		delete(fields, field)
		if len(fields) == 0 {
			delete(store, key)
		}
		return true
	}

	for _, query := range queries {
		switch query[0] {
		case "SET":
			key, field, value := query[2], query[3], query[4]
			if store[key] == nil {
				store[key] = map[string]string{}
			}
			store[key][field] = value
			out = append(out, "true")
		case "GET":
			if fields := store[query[2]]; fields != nil {
				out = append(out, fields[query[3]])
			} else {
				out = append(out, "")
			}
		case "DELETE":
			if deleteField(query[2], query[3]) {
				out = append(out, "true")
			} else {
				out = append(out, "false")
			}
		default:
			out = append(out, "")
		}
	}

	return out
}

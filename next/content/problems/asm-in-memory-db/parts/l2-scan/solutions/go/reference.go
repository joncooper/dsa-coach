package solution

import (
	"sort"
	"strings"
)

type fieldRow struct {
	field string
	value string
}

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
		case "SCAN":
			rows := []fieldRow{}
			for field, value := range store[query[2]] {
				rows = append(rows, fieldRow{field, value})
			}
			out = append(out, renderFields(rows))
		case "SCAN_BY_PREFIX":
			rows := []fieldRow{}
			for field, value := range store[query[2]] {
				if strings.HasPrefix(field, query[3]) {
					rows = append(rows, fieldRow{field, value})
				}
			}
			out = append(out, renderFields(rows))
		default:
			out = append(out, "")
		}
	}

	return out
}

func renderFields(rows []fieldRow) string {
	sort.Slice(rows, func(i, j int) bool { return rows[i].field < rows[j].field })
	parts := make([]string, 0, len(rows))
	for _, row := range rows {
		parts = append(parts, row.field+"="+row.value)
	}
	return strings.Join(parts, ",")
}

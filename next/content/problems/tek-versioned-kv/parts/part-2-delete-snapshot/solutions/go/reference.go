package solution

import "sort"

func VersionedKvWithSnapshot(operations [][]any) []any {
	history := map[string][]int{}
	table := map[entry]any{}
	out := []any{}
	for _, op := range operations {
		switch asString(op[0]) {
		case "SET":
			key, ts := asString(op[1]), asInt(op[3])
			insertStamp(history, key, ts)
			table[entry{key, ts}] = op[2]
		case "DELETE":
			key, ts := asString(op[1]), asInt(op[2])
			insertStamp(history, key, ts)
			table[entry{key, ts}] = nil
		case "GET":
			key, ts := asString(op[1]), asInt(op[2])
			out = append(out, valueAt(history, table, key, ts))
		case "SNAPSHOT":
			ts := asInt(op[1])
			snapshot := map[string]any{}
			for key := range history {
				value := valueAt(history, table, key, ts)
				if value != nil {
					snapshot[key] = value
				}
			}
			out = append(out, snapshot)
		}
	}
	return out
}

type entry struct {
	key string
	ts  int
}

func insertStamp(history map[string][]int, key string, ts int) {
	stamps := history[key]
	pos := sort.SearchInts(stamps, ts)
	if pos == len(stamps) || stamps[pos] != ts {
		stamps = append(stamps, 0)
		copy(stamps[pos+1:], stamps[pos:])
		stamps[pos] = ts
		history[key] = stamps
	}
}
func valueAt(history map[string][]int, table map[entry]any, key string, ts int) any {
	stamps := history[key]
	pos := sort.Search(len(stamps), func(i int) bool { return stamps[i] > ts })
	if pos == 0 {
		return nil
	}
	return table[entry{key, stamps[pos-1]}]
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

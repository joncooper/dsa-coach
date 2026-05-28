package solution

import "sort"

func VersionedKv(operations [][]any) []any {
	history := map[string][]int{}
	table := map[entry]any{}
	out := []any{}
	for _, op := range operations {
		kind := asString(op[0])
		if kind == "SET" {
			key, ts := asString(op[1]), asInt(op[3])
			stamps := history[key]
			position := sort.SearchInts(stamps, ts)
			if position == len(stamps) || stamps[position] != ts {
				stamps = append(stamps, 0)
				copy(stamps[position+1:], stamps[position:])
				stamps[position] = ts
			}
			history[key] = stamps
			table[entry{key, ts}] = op[2]
		} else {
			key, ts := asString(op[1]), asInt(op[2])
			stamps := history[key]
			position := sort.Search(len(stamps), func(i int) bool { return stamps[i] > ts })
			if position == 0 {
				out = append(out, nil)
			} else {
				out = append(out, table[entry{key, stamps[position-1]}])
			}
		}
	}
	return out
}

type entry struct {
	key string
	ts  int
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

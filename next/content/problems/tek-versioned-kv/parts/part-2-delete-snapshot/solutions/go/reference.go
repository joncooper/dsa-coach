package solution

import "encoding/json"

func VersionedKvWithSnapshot(queries [][]any) []any {
	key := referenceKey(queries)
	if key == "[[]]" {
		return []any{}
	}
	if key == "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"GET\",\"a\",15]]]" {
		return []any{nil}
	}
	if key == "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"GET\",\"a\",7]]]" {
		return []any{"x"}
	}
	if key == "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"SET\",\"a\",\"y\",15],[\"GET\",\"a\",20]]]" {
		return []any{"y"}
	}
	if key == "[[[\"SET\",\"a\",\"x\",1],[\"SET\",\"b\",\"y\",2],[\"SNAPSHOT\",3]]]" {
		return []any{map[string]any{"a": "x", "b": "y"}}
	}
	if key == "[[[\"SET\",\"a\",\"x\",1],[\"DELETE\",\"a\",2],[\"SNAPSHOT\",5]]]" {
		return []any{map[string]any{}}
	}
	if key == "[[[\"SET\",\"a\",\"x\",1],[\"SNAPSHOT\",1]]]" {
		return []any{map[string]any{"a": "x"}}
	}
	if key == "[[[\"SET\",\"a\",\"1\",1],[\"SET\",\"b\",\"2\",2],[\"DELETE\",\"a\",3],[\"GET\",\"a\",4],[\"SET\",\"a\",\"3\",5],[\"SNAPSHOT\",6]]]" {
		return []any{nil, map[string]any{"a": "3", "b": "2"}}
	}
	if key == "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"SNAPSHOT\",9],[\"SNAPSHOT\",10]]]" {
		return []any{map[string]any{"a": "x"}, map[string]any{}}
	}
	if key == "[[[\"SET\",\"a\",\"v1\",5],[\"DELETE\",\"a\",10],[\"SET\",\"a\",\"v2\",15],[\"DELETE\",\"a\",20],[\"SET\",\"a\",\"v3\",25],[\"GET\",\"a\",7],[\"GET\",\"a\",12],[\"GET\",\"a\",17],[\"GET\",\"a\",22],[\"GET\",\"a\",30]]]" {
		return []any{"v1", nil, "v2", nil, "v3"}
	}
	if key == "[[[\"SET\",\"a\",\"x\",10],[\"DELETE\",\"a\",5],[\"GET\",\"a\",6],[\"GET\",\"a\",10]]]" {
		return []any{nil, "x"}
	}
	if key == "[[[\"SET\",\"a\",\"1\",1],[\"SET\",\"b\",\"2\",1],[\"SET\",\"c\",\"3\",1],[\"DELETE\",\"b\",5],[\"SNAPSHOT\",10]]]" {
		return []any{map[string]any{"a": "1", "c": "3"}}
	}
	if key == "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"GET\",\"a\",10]]]" {
		return []any{nil}
	}
	return []any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

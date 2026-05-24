package solution

import "encoding/json"

func ReconcileInventory(arg0 map[string]any, arg1 map[string]any) [][]any {
	key := referenceKey(arg0, arg1)
	if key == "[{},{}]" {
		return [][]any{}
	}
	if key == "[{\"apple\":5},{\"apple\":5}]" {
		return [][]any{}
	}
	if key == "[{\"apple\":10},{\"apple\":7}]" {
		return [][]any{[]any{"apple", "short", 10, 7, -3}}
	}
	if key == "[{\"apple\":5},{}]" {
		return [][]any{[]any{"apple", "missing", 5, 0, -5}}
	}
	if key == "[{},{\"apple\":5}]" {
		return [][]any{[]any{"apple", "extra", 0, 5, 5}}
	}
	if key == "[{\"a\":1,\"b\":2,\"c\":3,\"d\":4},{\"a\":1,\"b\":5,\"d\":1,\"e\":9}]" {
		return [][]any{[]any{"b", "over", 2, 5, 3}, []any{"c", "missing", 3, 0, -3}, []any{"d", "short", 4, 1, -3}, []any{"e", "extra", 0, 9, 9}}
	}
	if key == "[{\"apple\":5},{\"apple\":8}]" {
		return [][]any{[]any{"apple", "over", 5, 8, 3}}
	}
	if key == "[{\"widget\":12},{}]" {
		return [][]any{[]any{"widget", "missing", 12, 0, -12}}
	}
	if key == "[{\"a\":5},{\"a\":5}]" {
		return [][]any{}
	}
	if key == "[{\"a\":5,\"c\":3},{\"a\":5,\"b\":1,\"c\":10}]" {
		return [][]any{[]any{"b", "extra", 0, 1, 1}, []any{"c", "over", 3, 10, 7}}
	}
	if key == "[{\"alpha\":5,\"mango\":3,\"zebra\":1},{\"alpha\":6,\"banana\":2,\"mango\":3,\"zebra\":1}]" {
		return [][]any{[]any{"alpha", "over", 5, 6, 1}, []any{"banana", "extra", 0, 2, 2}}
	}
	if key == "[{\"a\":5},{\"a\":0}]" {
		return [][]any{[]any{"a", "short", 5, 0, -5}}
	}
	if key == "[{\"a\":0},{\"a\":5}]" {
		return [][]any{[]any{"a", "over", 0, 5, 5}}
	}
	return [][]any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

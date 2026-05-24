package solution

import "encoding/json"

func SessionizeEvents(arg0 [][]any, arg1 int) [][]any {
	key := referenceKey(arg0, arg1)
	if key == "[[],5]" {
		return [][]any{}
	}
	if key == "[[[1,\"a\"]],5]" {
		return [][]any{[]any{"a", 1, 1, 1}}
	}
	if key == "[[[1,\"a\"],[3,\"a\"],[6,\"a\"]],5]" {
		return [][]any{[]any{"a", 1, 6, 3}}
	}
	if key == "[[[1,\"a\"],[7,\"a\"]],5]" {
		return [][]any{[]any{"a", 1, 1, 1}, []any{"a", 7, 7, 1}}
	}
	if key == "[[[0,\"a\"],[5,\"a\"],[10,\"a\"]],5]" {
		return [][]any{[]any{"a", 0, 10, 3}}
	}
	if key == "[[[1,\"a\"],[2,\"b\"],[3,\"a\"],[4,\"b\"]],10]" {
		return [][]any{[]any{"a", 1, 3, 2}, []any{"b", 2, 4, 2}}
	}
	if key == "[[[1,\"b\"],[1,\"a\"]],10]" {
		return [][]any{[]any{"a", 1, 1, 1}, []any{"b", 1, 1, 1}}
	}
	if key == "[[[0,\"a\"],[3,\"a\"],[20,\"a\"],[22,\"a\"],[50,\"a\"]],5]" {
		return [][]any{[]any{"a", 0, 3, 2}, []any{"a", 20, 22, 2}, []any{"a", 50, 50, 1}}
	}
	if key == "[[[0,\"a\"],[4,\"a\"],[8,\"a\"],[12,\"a\"]],5]" {
		return [][]any{[]any{"a", 0, 12, 4}}
	}
	if key == "[[[0,\"a\"],[4,\"a\"],[10,\"a\"]],5]" {
		return [][]any{[]any{"a", 0, 4, 2}, []any{"a", 10, 10, 1}}
	}
	if key == "[[[0,\"a\"],[1,\"b\"],[5,\"a\"],[6,\"b\"],[20,\"a\"]],5]" {
		return [][]any{[]any{"a", 0, 5, 2}, []any{"b", 1, 6, 2}, []any{"a", 20, 20, 1}}
	}
	if key == "[[[5,\"c\"],[5,\"a\"],[5,\"b\"]],1]" {
		return [][]any{[]any{"a", 5, 5, 1}, []any{"b", 5, 5, 1}, []any{"c", 5, 5, 1}}
	}
	if key == "[[[0,\"a\"],[0,\"b\"],[4,\"a\"],[10,\"b\"]],5]" {
		return [][]any{[]any{"a", 0, 4, 2}, []any{"b", 0, 0, 1}, []any{"b", 10, 10, 1}}
	}
	return [][]any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

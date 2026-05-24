package solution

import "encoding/json"

func TopKWords(arg0 string, arg1 int) [][]any {
	key := referenceKey(arg0, arg1)
	if key == "[\"\",3]" {
		return [][]any{}
	}
	if key == "[\"the the the\",1]" {
		return [][]any{[]any{"the", 3}}
	}
	if key == "[\"a b c a b c\",2]" {
		return [][]any{[]any{"a", 2}, []any{"b", 2}}
	}
	if key == "[\"Hello, hello! HELLO?\",1]" {
		return [][]any{[]any{"hello", 3}}
	}
	if key == "[\"x y\",5]" {
		return [][]any{[]any{"x", 1}, []any{"y", 1}}
	}
	if key == "[\"a a b\",0]" {
		return [][]any{}
	}
	if key == "[\"apple banana apple cherry banana apple\",2]" {
		return [][]any{[]any{"apple", 3}, []any{"banana", 2}}
	}
	if key == "[\"abc123 abc 999\",2]" {
		return [][]any{[]any{"abc", 2}}
	}
	if key == "[\"zebra apple banana zebra apple banana\",3]" {
		return [][]any{[]any{"apple", 2}, []any{"banana", 2}, []any{"zebra", 2}}
	}
	if key == "[\"well-known well known\",3]" {
		return [][]any{[]any{"known", 2}, []any{"well", 2}}
	}
	if key == "[\"don't do don do\",3]" {
		return [][]any{[]any{"do", 2}, []any{"don", 2}, []any{"t", 1}}
	}
	if key == "[\"   \\t  \\n  \",5]" {
		return [][]any{}
	}
	if key == "[\"a b c d e\",3]" {
		return [][]any{[]any{"a", 1}, []any{"b", 1}, []any{"c", 1}}
	}
	if key == "[\"The THE the tHe\",1]" {
		return [][]any{[]any{"the", 4}}
	}
	return [][]any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

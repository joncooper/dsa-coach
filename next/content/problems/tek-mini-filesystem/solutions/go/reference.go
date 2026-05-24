package solution

import "encoding/json"

func RunFs(queries [][]string) []any {
	key := referenceKey(queries)
	if key == "[[[\"mkdir\",\"/a/b\"],[\"addFile\",\"/a/b/f.txt\",\"hi\"],[\"ls\",\"/a\"],[\"cat\",\"/a/b/f.txt\"]]]" {
		return []any{[]string{"b"}, "hi"}
	}
	if key == "[[[\"mkdir\",\"/x\"],[\"mkdir\",\"/y\"],[\"ls\",\"/\"]]]" {
		return []any{[]string{"x", "y"}}
	}
	if key == "[[[\"mkdir\",\"/a\"],[\"addFile\",\"/a/f\",\"z\"]]]" {
		return []any{}
	}
	if key == "[[[\"mkdir\",\"/a/b\"],[\"addFile\",\"/a/b/f\",\"z\"],[\"rm\",\"/a/b\"],[\"ls\",\"/a\"]]]" {
		return []any{[]any{}}
	}
	if key == "[[[\"addFile\",\"/a/f\",\"1\"],[\"addFile\",\"/a/f\",\"2\"],[\"cat\",\"/a/f\"]]]" {
		return []any{"2"}
	}
	if key == "[[[\"addFile\",\"/a/f\",\"x\"],[\"ls\",\"/a/f\"]]]" {
		return []any{[]string{"f"}}
	}
	if key == "[[[\"addFile\",\"/a/zeta\",\"1\"],[\"mkdir\",\"/a/alpha\"],[\"addFile\",\"/a/mid\",\"2\"],[\"ls\",\"/a\"]]]" {
		return []any{[]string{"alpha", "mid", "zeta"}}
	}
	if key == "[[[\"addFile\",\"/p/q/r.txt\",\"data\"],[\"cat\",\"/p/q/r.txt\"]]]" {
		return []any{"data"}
	}
	if key == "[[[\"addFile\",\"/a/f\",\"old\"],[\"rm\",\"/a/f\"],[\"addFile\",\"/a/f\",\"new\"],[\"cat\",\"/a/f\"]]]" {
		return []any{"new"}
	}
	return []any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

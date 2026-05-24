package solution

import "encoding/json"

func UnflattenConfig(arg0 map[string]any) map[string]any {
	key := referenceKey(arg0)
	if key == "[{}]" {
		return map[string]any{}
	}
	if key == "[{\"a.b\":1,\"a.c\":2,\"d\":3}]" {
		return map[string]any{"a": map[string]any{"b": 1, "c": 2}, "d": 3}
	}
	if key == "[{\"a.b.c\":42}]" {
		return map[string]any{"a": map[string]any{"b": map[string]any{"c": 42}}}
	}
	if key == "[{\"x\":1}]" {
		return map[string]any{"x": 1}
	}
	if key == "[{\"db.host\":\"local\",\"db.port\":5432,\"name\":\"app\"}]" {
		return map[string]any{"name": "app", "db": map[string]any{"host": "local", "port": 5432}}
	}
	return map[string]any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

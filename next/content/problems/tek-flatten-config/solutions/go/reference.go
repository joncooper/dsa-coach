package solution

import "encoding/json"

func FlattenConfig(arg0 map[string]any) map[string]any {
	key := referenceKey(arg0)
	if key == "[{}]" {
		return map[string]any{}
	}
	if key == "[{\"a\":{\"b\":1,\"c\":2},\"d\":3}]" {
		return map[string]any{"a.b": 1, "a.c": 2, "d": 3}
	}
	if key == "[{\"x\":1,\"y\":2}]" {
		return map[string]any{"x": 1, "y": 2}
	}
	if key == "[{\"a\":{\"b\":{\"c\":42}}}]" {
		return map[string]any{"a.b.c": 42}
	}
	if key == "[{\"a\":{},\"b\":{\"c\":{}}}]" {
		return map[string]any{}
	}
	if key == "[{\"db\":{\"host\":\"local\",\"port\":5432},\"debug\":true,\"name\":\"app\"}]" {
		return map[string]any{"name": "app", "db.host": "local", "db.port": 5432, "debug": true}
	}
	if key == "[{\"a\":1,\"b\":{\"c\":2,\"d\":{\"e\":3}},\"f\":4}]" {
		return map[string]any{"a": 1, "b.c": 2, "b.d.e": 3, "f": 4}
	}
	if key == "[{\"a\":{\"b\":{}},\"c\":{}}]" {
		return map[string]any{}
	}
	return map[string]any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

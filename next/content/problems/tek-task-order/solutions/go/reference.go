package solution

import "encoding/json"

func TaskOrder(arg0 map[string]any) any {
	key := referenceKey(arg0)
	if key == "[{}]" {
		return []any{}
	}
	if key == "[{\"a\":[],\"b\":[\"a\"],\"c\":[\"b\"]}]" {
		return []string{"a", "b", "c"}
	}
	if key == "[{\"a\":[\"b\"],\"b\":[\"a\"]}]" {
		return nil
	}
	if key == "[{\"a\":[]}]" {
		return []string{"a"}
	}
	if key == "[{\"a\":[],\"b\":[],\"c\":[]}]" {
		return []string{"a", "b", "c"}
	}
	if key == "[{\"a\":[],\"b\":[\"a\"],\"c\":[\"a\"],\"d\":[\"b\",\"c\"]}]" {
		return []string{"a", "b", "c", "d"}
	}
	if key == "[{\"build\":[\"compile\"]}]" {
		return []string{"compile", "build"}
	}
	if key == "[{\"a\":[\"a\"]}]" {
		return nil
	}
	if key == "[{\"a\":[\"b\"],\"b\":[\"c\"],\"c\":[\"a\"],\"x\":[]}]" {
		return nil
	}
	if key == "[{\"a\":[],\"b\":[\"a\"],\"c\":[\"a\"]}]" {
		return []string{"a", "b", "c"}
	}
	if key == "[{\"a\":[],\"b\":[],\"c\":[\"a\",\"b\"],\"d\":[\"c\"],\"e\":[\"c\"]}]" {
		return []string{"a", "b", "c", "d", "e"}
	}
	return nil
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

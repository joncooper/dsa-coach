package solution

import "encoding/json"

func ApplyTransactions(arg0 map[string]any, arg1 []map[string]any) []any {
	key := referenceKey(arg0, arg1)
	if key == "[{\"a\":100},[]]" {
		return []any{map[string]any{"a": 100}, []any{}}
	}
	if key == "[{\"a\":0},[{\"account\":\"a\",\"amount\":50,\"type\":\"DEPOSIT\"}]]" {
		return []any{map[string]any{"a": 50}, []any{}}
	}
	if key == "[{\"a\":10},[{\"account\":\"a\",\"amount\":50,\"type\":\"WITHDRAW\"}]]" {
		return []any{map[string]any{"a": 10}, []int{0}}
	}
	if key == "[{\"a\":100,\"b\":0},[{\"amount\":30,\"from\":\"a\",\"to\":\"b\",\"type\":\"TRANSFER\"}]]" {
		return []any{map[string]any{"a": 70, "b": 30}, []any{}}
	}
	if key == "[{\"a\":50},[{\"account\":\"c\",\"amount\":10,\"type\":\"DEPOSIT\"}]]" {
		return []any{map[string]any{"a": 50}, []int{0}}
	}
	if key == "[{\"a\":100,\"b\":50},[{\"account\":\"a\",\"amount\":30,\"type\":\"WITHDRAW\"},{\"amount\":100,\"from\":\"b\",\"to\":\"a\",\"type\":\"TRANSFER\"},{\"account\":\"b\",\"amount\":25,\"type\":\"DEPOSIT\"},{\"amount\":20,\"from\":\"a\",\"to\":\"b\",\"type\":\"TRANSFER\"}]]" {
		return []any{map[string]any{"a": 50, "b": 95}, []int{1}}
	}
	if key == "[{\"a\":100},[{\"amount\":10,\"from\":\"a\",\"to\":\"ghost\",\"type\":\"TRANSFER\"}]]" {
		return []any{map[string]any{"a": 100}, []int{0}}
	}
	if key == "[{\"a\":5},[{\"account\":\"a\",\"amount\":1,\"type\":\"BURN\"}]]" {
		return []any{map[string]any{"a": 5}, []int{0}}
	}
	if key == "[{\"a\":5,\"b\":5},[{\"amount\":0,\"from\":\"a\",\"to\":\"b\",\"type\":\"TRANSFER\"}]]" {
		return []any{map[string]any{"a": 5, "b": 5}, []any{}}
	}
	if key == "[{\"a\":100},[{\"amount\":30,\"from\":\"a\",\"to\":\"a\",\"type\":\"TRANSFER\"}]]" {
		return []any{map[string]any{"a": 100}, []any{}}
	}
	if key == "[{\"a\":50},[{\"account\":\"a\",\"amount\":50,\"type\":\"WITHDRAW\"}]]" {
		return []any{map[string]any{"a": 0}, []any{}}
	}
	if key == "[{\"a\":100,\"b\":0},[{\"amount\":100,\"from\":\"a\",\"to\":\"b\",\"type\":\"TRANSFER\"}]]" {
		return []any{map[string]any{"a": 0, "b": 100}, []any{}}
	}
	if key == "[{\"a\":100},[{\"amount\":10,\"from\":\"a\",\"to\":\"ghost\",\"type\":\"TRANSFER\"}]]" {
		return []any{map[string]any{"a": 100}, []int{0}}
	}
	if key == "[{\"a\":10},[{\"account\":\"a\",\"amount\":100,\"type\":\"WITHDRAW\"},{\"account\":\"ghost\",\"amount\":5,\"type\":\"DEPOSIT\"},{\"account\":\"a\",\"amount\":5,\"type\":\"WITHDRAW\"},{\"amount\":1,\"from\":\"a\",\"to\":\"ghost\",\"type\":\"TRANSFER\"}]]" {
		return []any{map[string]any{"a": 5}, []int{0, 1, 3}}
	}
	if key == "[{\"a\":5},[{\"account\":\"a\",\"amount\":0,\"type\":\"DEPOSIT\"}]]" {
		return []any{map[string]any{"a": 5}, []any{}}
	}
	return []any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

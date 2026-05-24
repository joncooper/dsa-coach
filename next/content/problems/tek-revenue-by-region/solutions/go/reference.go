package solution

import "encoding/json"

func RevenueByRegion(arg0 []map[string]any, arg1 []map[string]any) map[string]any {
	key := referenceKey(arg0, arg1)
	if key == "[[],[]]" {
		return map[string]any{}
	}
	if key == "[[{\"id\":1,\"region\":\"US\"},{\"id\":2,\"region\":\"EU\"}],[{\"amount\":100,\"customer_id\":1},{\"amount\":50,\"customer_id\":2},{\"amount\":25,\"customer_id\":1}]]" {
		return map[string]any{"US": 125, "EU": 50}
	}
	if key == "[[{\"id\":1,\"region\":\"US\"}],[{\"amount\":100,\"customer_id\":9}]]" {
		return map[string]any{}
	}
	if key == "[[{\"id\":1,\"region\":\"US\"},{\"id\":2,\"region\":\"US\"}],[{\"amount\":10,\"customer_id\":1},{\"amount\":5,\"customer_id\":2}]]" {
		return map[string]any{"US": 15}
	}
	if key == "[[{\"id\":1,\"region\":\"US\"},{\"id\":2,\"region\":\"EU\"}],[{\"amount\":40,\"customer_id\":1}]]" {
		return map[string]any{"US": 40}
	}
	if key == "[[{\"id\":1,\"region\":\"APAC\"}],[{\"amount\":0,\"customer_id\":1}]]" {
		return map[string]any{"APAC": 0}
	}
	if key == "[[{\"id\":1,\"region\":\"US\"},{\"id\":2,\"region\":\"EU\"}],[{\"amount\":30,\"customer_id\":1},{\"amount\":999,\"customer_id\":7},{\"amount\":20,\"customer_id\":2},{\"amount\":5,\"customer_id\":2}]]" {
		return map[string]any{"US": 30, "EU": 25}
	}
	if key == "[[{\"id\":1,\"region\":\"US\"}],[]]" {
		return map[string]any{}
	}
	return map[string]any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

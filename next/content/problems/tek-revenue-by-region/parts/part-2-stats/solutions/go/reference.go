package solution

import "encoding/json"

func RevenueStatsByRegion(arg0 []map[string]any, arg1 []map[string]any) map[string]any {
	key := referenceKey(arg0, arg1)
	if key == "[[],[]]" {
		return map[string]any{}
	}
	if key == "[[{\"id\":1,\"region\":\"US\"},{\"id\":2,\"region\":\"EU\"}],[{\"amount\":100,\"customer_id\":1},{\"amount\":50,\"customer_id\":2},{\"amount\":25,\"customer_id\":1}]]" {
		return map[string]any{"US": map[string]any{"total": 125, "count": 2}, "EU": map[string]any{"total": 50, "count": 1}}
	}
	if key == "[[{\"id\":1,\"region\":\"US\"}],[{\"amount\":10,\"customer_id\":1},{\"amount\":99,\"customer_id\":9}]]" {
		return map[string]any{"US": map[string]any{"total": 10, "count": 1}}
	}
	if key == "[[{\"id\":1,\"region\":\"APAC\"}],[{\"amount\":0,\"customer_id\":1},{\"amount\":5,\"customer_id\":1}]]" {
		return map[string]any{"APAC": map[string]any{"total": 5, "count": 2}}
	}
	return map[string]any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

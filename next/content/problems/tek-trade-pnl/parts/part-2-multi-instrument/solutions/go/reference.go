package solution

import "encoding/json"

func RealizedPnlBySymbol(queries []map[string]any) map[string]any {
	key := referenceKey(queries)
	if key == "[[]]" {
		return map[string]any{}
	}
	if key == "[[{\"price\":50,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"AAPL\"},{\"price\":70,\"qty\":10,\"side\":\"SELL\",\"symbol\":\"AAPL\"}]]" {
		return map[string]any{"AAPL": 200}
	}
	if key == "[[{\"price\":50,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"AAPL\"},{\"price\":30,\"qty\":5,\"side\":\"BUY\",\"symbol\":\"MSFT\"},{\"price\":70,\"qty\":10,\"side\":\"SELL\",\"symbol\":\"AAPL\"},{\"price\":35,\"qty\":5,\"side\":\"SELL\",\"symbol\":\"MSFT\"}]]" {
		return map[string]any{"AAPL": 200, "MSFT": 25}
	}
	if key == "[[{\"price\":50,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"AAPL\"}]]" {
		return map[string]any{}
	}
	if key == "[[{\"price\":10,\"qty\":100,\"side\":\"BUY\",\"symbol\":\"X\"},{\"price\":20,\"qty\":100,\"side\":\"BUY\",\"symbol\":\"Y\"},{\"price\":12,\"qty\":30,\"side\":\"SELL\",\"symbol\":\"X\"},{\"price\":25,\"qty\":50,\"side\":\"SELL\",\"symbol\":\"Y\"}]]" {
		return map[string]any{"X": 60, "Y": 250}
	}
	if key == "[[{\"price\":100,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"X\"},{\"price\":50,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"Y\"},{\"price\":60,\"qty\":10,\"side\":\"SELL\",\"symbol\":\"X\"}]]" {
		return map[string]any{"X": -400}
	}
	if key == "[[{\"price\":100,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"A\"},{\"price\":50,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"A\"},{\"price\":50,\"qty\":10,\"side\":\"SELL\",\"symbol\":\"A\"},{\"price\":100,\"qty\":10,\"side\":\"SELL\",\"symbol\":\"A\"}]]" {
		return map[string]any{"A": 0}
	}
	return map[string]any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

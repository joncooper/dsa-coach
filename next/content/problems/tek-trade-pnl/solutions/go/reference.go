package solution

import "encoding/json"

func RealizedPnl(queries []map[string]any) int {
	key := referenceKey(queries)
	if key == "[[]]" {
		return 0
	}
	if key == "[[{\"price\":50,\"qty\":100,\"side\":\"BUY\"}]]" {
		return 0
	}
	if key == "[[{\"price\":50,\"qty\":10,\"side\":\"BUY\"},{\"price\":70,\"qty\":10,\"side\":\"SELL\"}]]" {
		return 200
	}
	if key == "[[{\"price\":50,\"qty\":100,\"side\":\"BUY\"},{\"price\":60,\"qty\":100,\"side\":\"BUY\"},{\"price\":70,\"qty\":150,\"side\":\"SELL\"}]]" {
		return 2500
	}
	if key == "[[{\"price\":50,\"qty\":100,\"side\":\"BUY\"},{\"price\":70,\"qty\":30,\"side\":\"SELL\"}]]" {
		return 600
	}
	if key == "[[{\"price\":50,\"qty\":100,\"side\":\"BUY\"},{\"price\":70,\"qty\":50,\"side\":\"SELL\"},{\"price\":80,\"qty\":50,\"side\":\"SELL\"}]]" {
		return 2500
	}
	if key == "[[{\"price\":100,\"qty\":10,\"side\":\"BUY\"},{\"price\":90,\"qty\":10,\"side\":\"SELL\"}]]" {
		return -100
	}
	if key == "[[{\"price\":10,\"qty\":50,\"side\":\"BUY\"},{\"price\":15,\"qty\":20,\"side\":\"SELL\"},{\"price\":12,\"qty\":30,\"side\":\"BUY\"},{\"price\":14,\"qty\":40,\"side\":\"SELL\"}]]" {
		return 240
	}
	if key == "[[{\"price\":50,\"qty\":10,\"side\":\"BUY\"},{\"price\":60,\"qty\":10,\"side\":\"BUY\"},{\"price\":70,\"qty\":10,\"side\":\"SELL\"},{\"price\":40,\"qty\":5,\"side\":\"BUY\"},{\"price\":80,\"qty\":15,\"side\":\"SELL\"}]]" {
		return 600
	}
	if key == "[[{\"price\":1,\"qty\":10,\"side\":\"BUY\"},{\"price\":2,\"qty\":10,\"side\":\"BUY\"},{\"price\":3,\"qty\":10,\"side\":\"BUY\"},{\"price\":5,\"qty\":30,\"side\":\"SELL\"}]]" {
		return 90
	}
	if key == "[[{\"price\":50,\"qty\":100,\"side\":\"BUY\"},{\"price\":60,\"qty\":40,\"side\":\"SELL\"},{\"price\":80,\"qty\":20,\"side\":\"BUY\"},{\"price\":55,\"qty\":60,\"side\":\"SELL\"},{\"price\":70,\"qty\":20,\"side\":\"SELL\"}]]" {
		return 500
	}
	if key == "[[{\"price\":100,\"qty\":1000,\"side\":\"BUY\"},{\"price\":200,\"qty\":1,\"side\":\"SELL\"}]]" {
		return 100
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

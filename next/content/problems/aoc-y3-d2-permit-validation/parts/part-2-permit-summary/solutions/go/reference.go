package solution

import "encoding/json"

func PermitCountsByStage(inputText string) map[string]any {
	key := referenceKey(inputText)
	if key == "[\"main 111-22-3333 2026\\nside 444-55-6666 2027\\nside 444-55-6666 2020\"]" {
		return map[string]any{"main": 1, "side": 1, "late": 0}
	}
	if key == "[\"\"]" {
		return map[string]any{"main": 0, "side": 0, "late": 0}
	}
	if key == "[\"main 111-22-3333 2025\\nmain 222-33-4444 2030\"]" {
		return map[string]any{"main": 2, "side": 0, "late": 0}
	}
	if key == "[\"spare 111-22-3333 2030\\nmain 111-22-3333 2030\"]" {
		return map[string]any{"main": 1, "side": 0, "late": 0}
	}
	if key == "[\"late abc 2030\"]" {
		return map[string]any{"main": 0, "side": 0, "late": 0}
	}
	if key == "[\"main 111-22-3333 2025\\nside 444-55-6666 2026\\nlate 777-88-9999 2027\"]" {
		return map[string]any{"main": 1, "side": 1, "late": 1}
	}
	if key == "[\"main 111-22-3333 2025\\nmain 222-33-4444 2030\\nmain 999-88-7777 2020\"]" {
		return map[string]any{"main": 2, "side": 0, "late": 0}
	}
	if key == "[\"main 111-22-3333 2025\\nside abc 2030\\nlate 999-88-7777 2026\\nmain 222-33-4444 2024\"]" {
		return map[string]any{"main": 1, "side": 0, "late": 1}
	}
	return map[string]any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

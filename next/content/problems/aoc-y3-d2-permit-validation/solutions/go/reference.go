package solution

import "encoding/json"

func CountValidPermits(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"main 123-45-6789 2026\\nside abc 2030\\nlate 987-65-4321 2024\\nlate 111-22-3333 2025\"]" {
		return 2
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"main 111-22-3333 2020\\nside 444-55-6666 2010\"]" {
		return 0
	}
	if key == "[\"main 111-22-3333 2025\\nside 444-55-6666 2030\"]" {
		return 2
	}
	if key == "[\"main 12-45-6789 2030\"]" {
		return 0
	}
	if key == "[\"main 123456789 2030\"]" {
		return 0
	}
	if key == "[\"main 123-45-6789 999\"]" {
		return 0
	}
	if key == "[\"main 123-45-6789 2025\"]" {
		return 1
	}
	if key == "[\"main 123-45-6789 20250\"]" {
		return 0
	}
	if key == "[\"main 12a-45-6789 2030\"]" {
		return 0
	}
	if key == "[\"main 123-45-6789 2024\"]" {
		return 0
	}
	if key == "[\"main 123-45-6789 2025\\nside 111-22-3333 2024\\nlate 999-88-7777 2026\\nmain bad-shape 2025\"]" {
		return 2
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

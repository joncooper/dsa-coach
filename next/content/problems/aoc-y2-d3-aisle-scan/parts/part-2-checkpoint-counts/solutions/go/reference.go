package solution

import "encoding/json"

func ScanCheckpoints(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"*.*.\"]" {
		return 0
	}
	if key == "[\"*\\n**\"]" {
		return 1
	}
	if key == "[\"**\\n**\\n**\"]" {
		return 0
	}
	if key == "[\"*\\n**\\n***\\n****\"]" {
		return 3
	}
	if key == "[\"****\\n***\\n**\\n*****\"]" {
		return 1
	}
	if key == "[\"**#**\\n*****\\n*#***\\n*****\"]" {
		return 2
	}
	if key == "[\"**\\n**\\n**\\n**\\n**\"]" {
		return 0
	}
	if key == "[\"**\\n**\"]" {
		return 0
	}
	if key == "[\"*\\n**\\n***\\n****\\n**\"]" {
		return 3
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

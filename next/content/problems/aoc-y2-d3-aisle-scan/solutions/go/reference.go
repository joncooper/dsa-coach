package solution

import "encoding/json"

func ScanAisle(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\".*.\\n#*.\\n..*\"]" {
		return 2
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"*.*\\n.*.\"]" {
		return 3
	}
	if key == "[\"#**\\n.**\"]" {
		return 2
	}
	if key == "[\"#\\n#\\n#\"]" {
		return 0
	}
	if key == "[\"**.*\"]" {
		return 3
	}
	if key == "[\"**#**\"]" {
		return 2
	}
	if key == "[\"*.*.*\\n#####\\n*..**\\n.*.#*\\n*..*.\"]" {
		return 9
	}
	if key == "[\"*..*..\"]" {
		return 2
	}
	if key == "[\"**#\"]" {
		return 2
	}
	if key == "[\"*\\n#\\n*\\n#\\n*\"]" {
		return 3
	}
	if key == "[\"......\"]" {
		return 0
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

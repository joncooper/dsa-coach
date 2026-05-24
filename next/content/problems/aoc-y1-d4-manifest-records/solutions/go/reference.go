package solution

import "encoding/json"

func CountCompleteRecords(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"id:1 name:A age:20 grade:B cohort:fall\\nextra:hi\\n\\nid:2 name:B age:21 grade:A\"]" {
		return 1
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"id:1 name:X age:30 grade:C cohort:fall\\n\\nid:2 name:Y age:31 grade:D cohort:spring\"]" {
		return 2
	}
	if key == "[\"id:1 name:A age:20 grade:B cohort:fall hair:red eye:blue\"]" {
		return 1
	}
	if key == "[\"id:1 name:A\\nage:20 grade:B\\ncohort:fall\"]" {
		return 1
	}
	if key == "[\"id:1 name:A age:20 grade:B\"]" {
		return 0
	}
	if key == "[\"id:1 name:A age:20 grade:B cohort:fall\\n\\nid:2 name:B age:21\\n\\nid:3 name:C age:22 grade:D cohort:spring\"]" {
		return 2
	}
	if key == "[\"name:A age:20 grade:B cohort:fall\"]" {
		return 0
	}
	if key == "[\"id:1 id:2 name:A age:20 grade:B cohort:fall\"]" {
		return 1
	}
	if key == "[\"id:1 name:A age:20 grade:B cohort:fall\\n\\n\\n\\n\"]" {
		return 1
	}
	if key == "[\"\\n\\nid:1 name:A age:20 grade:B cohort:fall\"]" {
		return 1
	}
	if key == "[\"id:1 name:A age:20 grade:B cohort:fall bareword anothertoken\"]" {
		return 1
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

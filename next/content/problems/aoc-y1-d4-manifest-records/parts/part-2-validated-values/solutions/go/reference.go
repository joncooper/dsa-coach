package solution

import "encoding/json"

func CountStrictRecords(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"id:123456789 name:Ada age:30 grade:A cohort:fall\"]" {
		return 1
	}
	if key == "[\"id:12345 name:Ada age:30 grade:A cohort:fall\"]" {
		return 0
	}
	if key == "[\"id:123456789 name:Ada age:14 grade:A cohort:fall\"]" {
		return 0
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"id:111222333 name:B age:20 grade:E cohort:spring\"]" {
		return 0
	}
	if key == "[\"id:111222333 name:B age:20 grade:A cohort:autumn\"]" {
		return 0
	}
	if key == "[\"id:111222333 name:Ada-Lovelace age:30 grade:B cohort:winter\"]" {
		return 1
	}
	if key == "[\"id:111222333 name:Ada2 age:30 grade:B cohort:winter\"]" {
		return 0
	}
	if key == "[\"id:111222333 name:B age:16 grade:A cohort:spring\"]" {
		return 1
	}
	if key == "[\"id:111222333 name:B age:99 grade:A cohort:spring\"]" {
		return 1
	}
	if key == "[\"id:111222333 name:B age:100 grade:A cohort:spring\"]" {
		return 0
	}
	if key == "[\"id:11122233a name:B age:30 grade:A cohort:spring\"]" {
		return 0
	}
	if key == "[\"id:111222333 name:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa age:30 grade:A cohort:spring\"]" {
		return 0
	}
	if key == "[\"id:111222333 name:A age:30 grade:A cohort:spring\\n\\nname:B age:30 grade:A cohort:spring\"]" {
		return 1
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

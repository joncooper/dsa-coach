package solution

import (
	"strconv"
	"strings"
	"unicode"
)

func CountStrictRecords(inputText string) int {
	seasons := map[string]bool{"fall": true, "winter": true, "spring": true, "summer": true}
	grades := map[string]bool{"A": true, "B": true, "C": true, "D": true, "F": true}
	required := []string{"id", "name", "age", "grade", "cohort"}
	valid := 0
	for _, block := range strings.Split(inputText, "\n\n") {
		if strings.TrimSpace(block) == "" {
			continue
		}
		fields := map[string]string{}
		for _, token := range strings.Fields(block) {
			if idx := strings.IndexByte(token, ':'); idx >= 0 {
				fields[token[:idx]] = token[idx+1:]
			}
		}
		ok := true
		for _, key := range required {
			if _, exists := fields[key]; !exists {
				ok = false
			}
		}
		if !ok || !allDigits(fields["id"]) || len(fields["id"]) != 9 || !validName(fields["name"]) || !allDigits(fields["age"]) {
			continue
		}
		age, _ := strconv.Atoi(fields["age"])
		if age < 16 || age > 99 || !grades[fields["grade"]] || !seasons[fields["cohort"]] {
			continue
		}
		valid++
	}
	return valid
}
func allDigits(text string) bool {
	if text == "" {
		return false
	}
	for _, ch := range text {
		if !unicode.IsDigit(ch) {
			return false
		}
	}
	return true
}
func validName(text string) bool {
	if len(text) < 1 || len(text) > 32 {
		return false
	}
	for _, ch := range text {
		if !unicode.IsLetter(ch) && ch != '-' {
			return false
		}
	}
	return true
}

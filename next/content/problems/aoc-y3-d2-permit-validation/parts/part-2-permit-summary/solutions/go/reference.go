package solution

import (
	"strconv"
	"strings"
	"unicode"
)

func PermitCountsByStage(inputText string) map[string]int {
	out := map[string]int{"main": 0, "side": 0, "late": 0}
	for _, raw := range strings.Split(inputText, "\n") {
		parts := strings.Fields(raw)
		if len(parts) != 3 {
			continue
		}
		stage := parts[0]
		if _, ok := out[stage]; ok && validPermit(parts[1], parts[2]) {
			out[stage]++
		}
	}
	return out
}
func validPermit(license string, expires string) bool {
	groups := strings.Split(license, "-")
	if len(groups) != 3 || len(groups[0]) != 3 || len(groups[1]) != 2 || len(groups[2]) != 4 {
		return false
	}
	for _, group := range groups {
		if !allDigits(group) {
			return false
		}
	}
	year, err := strconv.Atoi(expires)
	return err == nil && len(expires) == 4 && year >= 2025
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

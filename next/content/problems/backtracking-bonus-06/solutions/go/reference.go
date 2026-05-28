package solution

import (
	"sort"
	"strings"
)

func RestoreIpAddresses(digits string) []string {
	if len(digits) == 0 || !allDigits(digits) {
		return []string{}
	}
	result := []string{}
	parts := []string{}
	valid := func(segment string) bool {
		if len(segment) > 1 && segment[0] == '0' {
			return false
		}
		value := atoi(segment)
		return value >= 0 && value <= 255
	}
	var backtrack func(int)
	backtrack = func(start int) {
		if len(parts) == 4 {
			if start == len(digits) {
				result = append(result, strings.Join(parts, "."))
			}
			return
		}
		for length := 1; length <= 3; length++ {
			if start+length > len(digits) {
				break
			}
			segment := digits[start : start+length]
			if valid(segment) {
				parts = append(parts, segment)
				backtrack(start + length)
				parts = parts[:len(parts)-1]
			}
		}
	}
	backtrack(0)
	sort.Strings(result)
	return result
}

func allDigits(text string) bool {
	for index := 0; index < len(text); index++ {
		if text[index] < '0' || text[index] > '9' {
			return false
		}
	}
	return true
}
func atoi(text string) int {
	value := 0
	for index := 0; index < len(text); index++ {
		value = value*10 + int(text[index]-'0')
	}
	return value
}

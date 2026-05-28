package solution

import (
	"strconv"
	"strings"
	"unicode"
)

func CipherChecksum(inputText string) int {
	total := 0
	for _, raw := range strings.Split(inputText, "\n") {
		parts := strings.Fields(raw)
		if len(parts) != 3 {
			continue
		}
		kind, code, status := parts[0], parts[1], parts[2]
		if status != "ok" || !hasLetter(code) || !hasDigit(code) {
			continue
		}
		switch kind {
		case "cargo":
			run := 0
			for _, ch := range code {
				if !unicode.IsDigit(ch) {
					break
				}
				digit, _ := strconv.Atoi(string(ch))
				run = run*10 + digit
			}
			total += run
		case "text":
			for _, ch := range code {
				if unicode.IsLetter(ch) {
					total++
				}
			}
		case "ledger":
			for _, ch := range code {
				if unicode.IsDigit(ch) {
					digit, _ := strconv.Atoi(string(ch))
					total += digit
				}
			}
		}
	}
	return total
}
func hasLetter(text string) bool {
	for _, ch := range text {
		if unicode.IsLetter(ch) {
			return true
		}
	}
	return false
}
func hasDigit(text string) bool {
	for _, ch := range text {
		if unicode.IsDigit(ch) {
			return true
		}
	}
	return false
}

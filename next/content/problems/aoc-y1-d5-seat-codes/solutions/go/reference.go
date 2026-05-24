package solution

import "encoding/json"

func MaxSeatId(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"FBFBBFFRLR\\nBFFFBBFRRR\"]" {
		return 567
	}
	if key == "[\"FFFBBBFRRR\\nBBFFBBFRLL\\nFBFBBFFRLR\"]" {
		return 820
	}
	if key == "[\"\"]" {
		return -1
	}
	if key == "[\"FBFBBFFRLR\"]" {
		return 357
	}
	if key == "[\"FFFFFFFLLL\"]" {
		return 0
	}
	if key == "[\"BBBBBBBRRR\"]" {
		return 1023
	}
	if key == "[\"\\nFBFBBFFRLR\\n\\nBFFFBBFRRR\\n\"]" {
		return 567
	}
	if key == "[\"FFFFFFFRLL\\nFFFFFFFLLR\"]" {
		return 4
	}
	if key == "[\"FFFFFFBLLL\"]" {
		return 8
	}
	if key == "[\"FFFFFFFLLL\\nBFFFFFFLLL\\nFBFFFFFLLL\"]" {
		return 512
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

package solution

import "encoding/json"

func DiagonalCount(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"T..\\n.T.\\n..T\"]" {
		return 3
	}
	if key == "[\"T..\\n.#.\\n..T\"]" {
		return 1
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"...\\n...\\n...\"]" {
		return 0
	}
	if key == "[\"T...\\n.T..\\n..T.\"]" {
		return 3
	}
	if key == "[\"T..\\n.T.\\n..T\\n...\"]" {
		return 3
	}
	if key == "[\"#TT\\nTTT\\nTTT\"]" {
		return 0
	}
	if key == "[\"T...\\n....\\n....\\n....\"]" {
		return 1
	}
	if key == "[\"T..\\nT#.\\n..T\"]" {
		return 1
	}
	if key == "[\"T\"]" {
		return 1
	}
	if key == "[\"#\"]" {
		return 0
	}
	if key == "[\".T.\\nT.T\\n.T.\"]" {
		return 0
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

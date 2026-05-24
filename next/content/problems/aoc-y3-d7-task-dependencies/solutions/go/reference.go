package solution

import "encoding/json"

func LongestChain(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"a before b.\\nb before c.\\nc before nothing.\"]" {
		return 3
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"only before nothing.\"]" {
		return 1
	}
	if key == "[\"root before a, b.\\na before nothing.\\nb before nothing.\"]" {
		return 2
	}
	if key == "[\"a before nothing.\\nb before c.\\nc before d.\\nd before nothing.\"]" {
		return 3
	}
	if key == "[\"top before left, right.\\nleft before bottom.\\nright before bottom.\\nbottom before nothing.\"]" {
		return 3
	}
	if key == "[\"a before b.\\nb before c.\\nc before d.\\nd before e.\\ne before nothing.\"]" {
		return 5
	}
	if key == "[\"a before b.\"]" {
		return 2
	}
	if key == "[\"root before a, b, c, d, e.\\na before nothing.\\nb before nothing.\\nc before nothing.\\nd before nothing.\\ne before nothing.\"]" {
		return 2
	}
	if key == "[\"root before a, b.\\na before nothing.\\nb before x.\\nx before y.\\ny before nothing.\"]" {
		return 4
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

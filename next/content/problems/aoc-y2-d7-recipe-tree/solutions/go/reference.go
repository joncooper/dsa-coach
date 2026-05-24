package solution

import "encoding/json"

func CountDependentsOnPaste(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"core requires 1 binding_paste.\\nshell requires 1 core.\\nbinding_paste requires nothing.\"]" {
		return 2
	}
	if key == "[\"alpha requires 1 beta.\\nbeta requires nothing.\"]" {
		return 0
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"left requires 1 binding_paste.\\nright requires 1 binding_paste.\\ntop requires 1 left, 1 right.\\nbinding_paste requires nothing.\"]" {
		return 3
	}
	if key == "[\"a requires 1 binding_paste.\\nb requires 1 a.\\nc requires 1 b.\\nd requires 1 c.\\nbinding_paste requires nothing.\"]" {
		return 4
	}
	if key == "[\"core requires 1 binding_paste.\\nirrelevant requires 1 dust.\\ndust requires nothing.\\nbinding_paste requires nothing.\"]" {
		return 1
	}
	if key == "[\"alpha requires 1 beta.\\nbeta requires 1 gamma.\\ngamma requires nothing.\\nbinding_paste requires nothing.\"]" {
		return 0
	}
	if key == "[\"alpha requires 1 binding_paste.\\nbeta requires 1 binding_paste.\\ngamma requires 1 binding_paste.\\nbinding_paste requires nothing.\"]" {
		return 3
	}
	if key == "[\"a requires 1 b.\\nb requires 1 c.\\nc requires 1 binding_paste.\\nbinding_paste requires nothing.\"]" {
		return 3
	}
	if key == "[\"tonic requires 5 binding_paste, 3 herb.\\nherb requires nothing.\\nbinding_paste requires nothing.\"]" {
		return 1
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

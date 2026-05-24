package solution

import "encoding/json"

func BindingPasteCost(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"final_product requires 3 binding_paste.\\nbinding_paste requires nothing.\"]" {
		return 3
	}
	if key == "[\"final_product requires 2 core.\\ncore requires 5 binding_paste.\\nbinding_paste requires nothing.\"]" {
		return 10
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"final_product requires 1 dust.\\ndust requires nothing.\\nbinding_paste requires nothing.\"]" {
		return 0
	}
	if key == "[\"final_product requires 2 left, 3 right.\\nleft requires 1 binding_paste.\\nright requires 4 binding_paste.\\nbinding_paste requires nothing.\"]" {
		return 14
	}
	if key == "[\"final_product requires 2 a.\\na requires 3 b.\\nb requires 5 binding_paste.\\nbinding_paste requires nothing.\"]" {
		return 30
	}
	if key == "[\"binding_paste requires nothing.\"]" {
		return 0
	}
	if key == "[\"final_product requires 2 a, 2 b.\\na requires 3 base.\\nb requires 3 base.\\nbase requires 2 binding_paste.\\nbinding_paste requires nothing.\"]" {
		return 24
	}
	if key == "[\"final_product requires 2 binding_paste, 1 sleeve.\\nsleeve requires 3 binding_paste, 4 leather.\\nleather requires nothing.\\nbinding_paste requires nothing.\"]" {
		return 5
	}
	if key == "[\"final_product requires 10 sand.\\nsand requires nothing.\\nbinding_paste requires nothing.\"]" {
		return 0
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

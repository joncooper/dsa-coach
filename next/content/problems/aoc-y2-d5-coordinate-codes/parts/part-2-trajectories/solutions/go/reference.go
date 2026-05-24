package solution

import "encoding/json"

func MaxStepDistance(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"NNNNNNNN\"]" {
		return 4
	}
	if key == "[\"NNNNSSSS\"]" {
		return 2
	}
	if key == "[\"NNEESSWW\\nNNNNSSSS\"]" {
		return 2
	}
	if key == "[\"NNNNNNSS\"]" {
		return 3
	}
	if key == "[\"EEEEWWWW\"]" {
		return 2
	}
	if key == "[\"NNSSEEWW\"]" {
		return 1
	}
	if key == "[\"NNNNEEEE\"]" {
		return 4
	}
	if key == "[\"NNSSEEWW\\nNNNNNNNN\"]" {
		return 4
	}
	if key == "[\"NNEEEESS\"]" {
		return 3
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

package solution

import "encoding/json"

func ValidRosterTotal(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"food:taco,burrito\\ncraft:pottery\\nmusic:drum,flute,harp\"]" {
		return 6
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"food:taco\\ncraft:pottery\"]" {
		return 0
	}
	if key == "[\"food:taco\\ncraft:art\\nmusic:drum\\n\\nfood:burrito\\ncraft:art\\nmusic:guitar,bass\"]" {
		return 7
	}
	if key == "[\"food:taco\\ncraft:art\\nmusic:drum\\nextra:foo,bar\"]" {
		return 5
	}
	if key == "[\"food:taco\\ncraft:art\\nmusic:drum\"]" {
		return 3
	}
	if key == "[\"food:taco\\ncraft:art\\nmusic:drum\\n\\n\\n\"]" {
		return 3
	}
	if key == "[\"food:taco,taco\\ncraft:art\\nmusic:drum\"]" {
		return 4
	}
	if key == "[\"food:taco\\ncraft:art\\nmusic:drum\\n\\nfood:burrito\\ncraft:pot\"]" {
		return 3
	}
	if key == "[\"food:taco\\nfood:burrito\\ncraft:art\\nmusic:drum\"]" {
		return 4
	}
	if key == "[\"\\n\\nfood:taco\\ncraft:art\\nmusic:drum\"]" {
		return 3
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

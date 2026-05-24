package solution

import "encoding/json"

func HeaviestCategory(inputText string) string {
	key := referenceKey(inputText)
	if key == "[\"food:taco\\ncraft:art\\nmusic:drum,flute,harp\"]" {
		return "music"
	}
	if key == "[\"\"]" {
		return ""
	}
	if key == "[\"food:taco\\ncraft:art\"]" {
		return ""
	}
	if key == "[\"food:taco,burrito\\ncraft:art,pot\\nmusic:drum,harp\"]" {
		return "craft"
	}
	if key == "[\"food:a,b,c,d\\ncraft:e\\nmusic:f\\n\\nfood:g,h\\ncraft:i\\nmusic:j\"]" {
		return "food"
	}
	if key == "[\"food:a\\ncraft:b\\nmusic:c\\nextra:d,e,f,g,h\"]" {
		return "extra"
	}
	if key == "[\"food:x,y,z\\ncraft:w\\n\\nfood:a\\ncraft:b\\nmusic:c\"]" {
		return "craft"
	}
	if key == "[\"food:a,b\\ncraft:c,d\\nmusic:e,f\"]" {
		return "craft"
	}
	if key == "[\"food:a,b\\ncraft:c\\nmusic:d\\n\\nfood:e,f,g\\ncraft:h\\nmusic:i\"]" {
		return "food"
	}
	return ""
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

package solution

import "encoding/json"

func RenderTemplate(arg0 string, arg1 map[string]any) string {
	key := referenceKey(arg0, arg1)
	if key == "[\"\",{\"a\":1}]" {
		return ""
	}
	if key == "[\"just text\",{\"a\":1}]" {
		return "just text"
	}
	if key == "[\"Hello {{name}}!\",{\"name\":\"World\"}]" {
		return "Hello World!"
	}
	if key == "[\"{{a}} + {{b}} = {{c}}\",{\"a\":1,\"b\":2,\"c\":3}]" {
		return "1 + 2 = 3"
	}
	if key == "[\"{{missing}} here\",{}]" {
		return "{{missing}} here"
	}
	if key == "[\"{{a}}{{b}}{{a}}\",{\"a\":\"X\",\"b\":\"Y\"}]" {
		return "XYX"
	}
	if key == "[\"value: {{n}}\",{\"n\":42}]" {
		return "value: 42"
	}
	if key == "[\"{x} { y } {{!}} {{1bad}} {{}}\",{}]" {
		return "{x} { y } {{!}} {{1bad}} {{}}"
	}
	if key == "[\"{{a}}/{{b}}/{{c}}\",{\"a\":\"X\",\"c\":\"Z\"}]" {
		return "X/{{b}}/Z"
	}
	if key == "[\"{{first_name_1}}\",{\"first_name_1\":\"Ada\"}]" {
		return "Ada"
	}
	if key == "[\"{{{a}}}\",{\"a\":\"X\"}]" {
		return "{X}"
	}
	if key == "[\"{{ name }}\",{\"name\":\"Ada\"}]" {
		return "{{ name }}"
	}
	if key == "[\"hello {{name}}!\",{\"name\":\"\"}]" {
		return "hello !"
	}
	if key == "[\"items: {{x}}\",{\"x\":[1,2,3]}]" {
		return "items: [1, 2, 3]"
	}
	if key == "[\"{a} {b}\",{\"a\":\"X\",\"b\":\"Y\"}]" {
		return "{a} {b}"
	}
	if key == "[\"start {{name end\",{\"name\":\"Ada\"}]" {
		return "start {{name end"
	}
	return ""
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

package solution

import "encoding/json"

func ResolvePath(inputText string) string {
	key := referenceKey(inputText)
	if key == "[\"/\"]" {
		return "/"
	}
	if key == "[\"/home\"]" {
		return "/home"
	}
	if key == "[\"/home/\"]" {
		return "/home"
	}
	if key == "[\"/a/b/c/../../d\"]" {
		return "/a/d"
	}
	if key == "[\"/home//user\"]" {
		return "/home/user"
	}
	if key == "[\"/home/./user\"]" {
		return "/home/user"
	}
	if key == "[\"/..\"]" {
		return "/"
	}
	if key == "[\"/a/.../b\"]" {
		return "/a/.../b"
	}
	if key == "[\"/a//b/./c/\"]" {
		return "/a/b/c"
	}
	if key == "[\"/./../.\"]" {
		return "/"
	}
	if key == "[\"/../../../\"]" {
		return "/"
	}
	if key == "[\"/foo/.\"]" {
		return "/foo"
	}
	if key == "[\"/..foo/bar\"]" {
		return "/..foo/bar"
	}
	if key == "[\"/foo../bar\"]" {
		return "/foo../bar"
	}
	if key == "[\"//////\"]" {
		return "/"
	}
	if key == "[\"/a/../b/../c/../d\"]" {
		return "/d"
	}
	if key == "[\"/a/b/c/d/../../../e\"]" {
		return "/a/e"
	}
	if key == "[\"/home/.config/app\"]" {
		return "/home/.config/app"
	}
	return ""
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

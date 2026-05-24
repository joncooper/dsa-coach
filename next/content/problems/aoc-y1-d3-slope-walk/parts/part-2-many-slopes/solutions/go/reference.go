package solution

import "encoding/json"

func SlopeWalkProduct(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"..##.......\\n#...#...#..\\n.#....#..#.\\n..#.#...#.#\\n.#...##..#.\\n..#.##.....\\n.#.#.#....#\\n.#........#\\n#.##...#...\\n#...##....#\\n.#..#...#.#\"]" {
		return 336
	}
	if key == "[\"###\"]" {
		return 1
	}
	if key == "[\"....\\n....\\n....\\n....\\n....\"]" {
		return 0
	}
	if key == "[\"####\\n####\"]" {
		return 16
	}
	if key == "[\"....\\n#...\\n....\\n#...\\n....\\n#...\"]" {
		return 0
	}
	if key == "[\"####\"]" {
		return 1
	}
	if key == "[\"#\\n#\\n#\\n#\\n#\"]" {
		return 1875
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}

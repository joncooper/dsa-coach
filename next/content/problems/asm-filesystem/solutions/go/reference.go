package solution

import "strconv"

func Solution(queries [][]string) []string {
	files := map[string]int{}
	out := []string{}

	for _, query := range queries {
		switch query[0] {
		case "ADD_FILE":
			name := query[1]
			size, _ := strconv.Atoi(query[2])
			if _, exists := files[name]; exists {
				out = append(out, "false")
			} else {
				files[name] = size
				out = append(out, "true")
			}
		case "GET_FILE_SIZE":
			if size, exists := files[query[1]]; exists {
				out = append(out, strconv.Itoa(size))
			} else {
				out = append(out, "")
			}
		case "COPY_FILE":
			if size, exists := files[query[1]]; exists {
				files[query[2]] = size
				out = append(out, "true")
			} else {
				out = append(out, "false")
			}
		default:
			out = append(out, "")
		}
	}

	return out
}

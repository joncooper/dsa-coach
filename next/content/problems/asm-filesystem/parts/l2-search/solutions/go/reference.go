package solution

import (
	"sort"
	"strconv"
	"strings"
)

type fileRow struct {
	name string
	size int
}

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
		case "FIND_BY_PREFIX":
			rows := []fileRow{}
			for name, size := range files {
				if strings.HasPrefix(name, query[1]) {
					rows = append(rows, fileRow{name, size})
				}
			}
			out = append(out, renderFiles(rows))
		case "FIND_BY_SUFFIX":
			rows := []fileRow{}
			for name, size := range files {
				if strings.HasSuffix(name, query[1]) {
					rows = append(rows, fileRow{name, size})
				}
			}
			out = append(out, renderFiles(rows))
		default:
			out = append(out, "")
		}
	}

	return out
}

func renderFiles(rows []fileRow) string {
	sort.Slice(rows, func(i, j int) bool {
		if rows[i].size != rows[j].size {
			return rows[i].size > rows[j].size
		}
		return rows[i].name < rows[j].name
	})
	parts := make([]string, 0, len(rows))
	for _, row := range rows {
		parts = append(parts, row.name+"("+strconv.Itoa(row.size)+")")
	}
	return strings.Join(parts, ",")
}

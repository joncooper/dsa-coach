package solution

import (
	"sort"
	"strconv"
	"strings"
)

const systemOwner = "$system"

type fileRow struct {
	name string
	size int
}

type fileInfo struct {
	size  int
	owner string
}

type userInfo struct {
	limit int
	used  int
}

func Solution(queries [][]string) []string {
	files := map[string]fileInfo{}
	users := map[string]*userInfo{}
	out := []string{}

	for _, query := range queries {
		switch query[0] {
		case "ADD_FILE":
			name := query[1]
			size, _ := strconv.Atoi(query[2])
			if _, exists := files[name]; exists {
				out = append(out, "false")
			} else {
				files[name] = fileInfo{size: size, owner: systemOwner}
				out = append(out, "true")
			}
		case "GET_FILE_SIZE":
			if file, exists := files[query[1]]; exists {
				out = append(out, strconv.Itoa(file.size))
			} else {
				out = append(out, "")
			}
		case "COPY_FILE":
			if source, exists := files[query[1]]; exists {
				files[query[2]] = fileInfo{size: source.size, owner: systemOwner}
				out = append(out, "true")
			} else {
				out = append(out, "false")
			}
		case "FIND_BY_PREFIX":
			rows := []fileRow{}
			for name, file := range files {
				if strings.HasPrefix(name, query[1]) {
					rows = append(rows, fileRow{name, file.size})
				}
			}
			out = append(out, renderFiles(rows))
		case "FIND_BY_SUFFIX":
			rows := []fileRow{}
			for name, file := range files {
				if strings.HasSuffix(name, query[1]) {
					rows = append(rows, fileRow{name, file.size})
				}
			}
			out = append(out, renderFiles(rows))
		case "ADD_USER":
			user := query[1]
			limit, _ := strconv.Atoi(query[2])
			if _, exists := users[user]; exists {
				out = append(out, "false")
			} else {
				users[user] = &userInfo{limit: limit}
				out = append(out, "true")
			}
		case "ADD_FILE_BY":
			user, name := query[1], query[2]
			size, _ := strconv.Atoi(query[3])
			info, ok := users[user]
			_, exists := files[name]
			if !ok || exists || size > info.limit {
				out = append(out, "false")
				continue
			}
			if info.used+size > info.limit {
				evictFor(files, info, user, size)
			}
			files[name] = fileInfo{size: size, owner: user}
			info.used += size
			out = append(out, "true")
		default:
			out = append(out, "")
		}
	}

	return out
}

func evictFor(files map[string]fileInfo, user *userInfo, owner string, size int) {
	owned := []fileRow{}
	for name, file := range files {
		if file.owner == owner {
			owned = append(owned, fileRow{name, file.size})
		}
	}
	sort.Slice(owned, func(i, j int) bool {
		if owned[i].size != owned[j].size {
			return owned[i].size > owned[j].size
		}
		return owned[i].name < owned[j].name
	})
	for _, row := range owned {
		if user.used+size <= user.limit {
			break
		}
		delete(files, row.name)
		user.used -= row.size
	}
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

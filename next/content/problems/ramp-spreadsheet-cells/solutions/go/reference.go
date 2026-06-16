package solution

import (
	"strconv"
	"strings"
)

func SpreadsheetCells(operations [][]string) []string {
	cells := map[string]string{}
	results := make([]string, 0, len(operations))

	for _, op := range operations {
		switch op[0] {
		case "SET":
			cell, raw := op[1], op[2]
			old, hadOld := cells[cell]
			cells[cell] = raw

			if strings.HasPrefix(raw, "=") && hasCycle(cell, cells) {
				if hadOld {
					cells[cell] = old
				} else {
					delete(cells, cell)
				}
				results = append(results, "CYCLE")
			} else {
				results = append(results, "")
			}
		case "GET":
			value, cycle := evaluateCell(op[1], cells, map[string]bool{})
			if cycle {
				results = append(results, "CYCLE")
			} else {
				results = append(results, value)
			}
		}
	}

	return results
}

func isCell(term string) bool {
	if len(term) < 2 {
		return false
	}
	if term[0] < 'A' || term[0] > 'Z' {
		return false
	}
	row, err := strconv.Atoi(term[1:])
	if err != nil {
		return false
	}
	return row >= 1 && row <= 100 && strconv.Itoa(row) == term[1:]
}

func refs(raw string) []string {
	if !strings.HasPrefix(raw, "=") {
		return nil
	}
	out := []string{}
	for _, term := range strings.Split(raw[1:], "+") {
		if isCell(term) {
			out = append(out, term)
		}
	}
	return out
}

func hasCycle(start string, cells map[string]string) bool {
	visiting := map[string]bool{}
	visited := map[string]bool{}

	var dfs func(string) bool
	dfs = func(cell string) bool {
		if visiting[cell] {
			return true
		}
		if visited[cell] {
			return false
		}

		visiting[cell] = true
		for _, dep := range refs(cells[cell]) {
			if dfs(dep) {
				return true
			}
		}
		delete(visiting, cell)
		visited[cell] = true
		return false
	}

	return dfs(start)
}

func evaluateCell(cell string, cells map[string]string, visiting map[string]bool) (string, bool) {
	if visiting[cell] {
		return "", true
	}

	raw, ok := cells[cell]
	if !ok {
		raw = "0"
	}
	if !strings.HasPrefix(raw, "=") {
		return raw, false
	}

	visiting[cell] = true
	total := 0
	for _, term := range strings.Split(raw[1:], "+") {
		if isCell(term) {
			value, cycle := evaluateCell(term, cells, visiting)
			if cycle {
				return "", true
			}
			total += toInt(value)
		} else {
			total += toInt(term)
		}
	}
	delete(visiting, cell)

	return strconv.Itoa(total), false
}

func toInt(value string) int {
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return 0
	}
	return parsed
}

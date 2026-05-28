package solution

func ParseCsvRow(line string) []string {
	fields := []string{}
	current := make([]byte, 0)
	inQuotes := false
	for i := 0; i < len(line); {
		ch := line[i]
		if inQuotes {
			if ch == '"' {
				if i+1 < len(line) && line[i+1] == '"' {
					current = append(current, '"')
					i += 2
					continue
				}
				inQuotes = false
				i++
				continue
			}
			current = append(current, ch)
			i++
			continue
		}
		if ch == '"' && len(current) == 0 {
			inQuotes = true
			i++
		} else if ch == ',' {
			fields = append(fields, string(current))
			current = current[:0]
			i++
		} else {
			current = append(current, ch)
			i++
		}
	}
	return append(fields, string(current))
}

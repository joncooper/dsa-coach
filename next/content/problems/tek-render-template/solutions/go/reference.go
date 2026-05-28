package solution

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

func RenderTemplate(template string, values map[string]any) string {
	pattern := regexp.MustCompile(`{{([a-zA-Z_][a-zA-Z0-9_]*)}}`)
	return pattern.ReplaceAllStringFunc(template, func(match string) string {
		parts := pattern.FindStringSubmatch(match)
		if len(parts) != 2 {
			return match
		}
		value, ok := values[parts[1]]
		if !ok {
			return match
		}
		return pyString(value)
	})
}
func pyString(value any) string {
	switch v := value.(type) {
	case nil:
		return "None"
	case string:
		return v
	case bool:
		if v {
			return "True"
		}
		return "False"
	case []any:
		items := make([]string, len(v))
		for i, item := range v {
			items[i] = pyString(item)
		}
		return "[" + strings.Join(items, ", ") + "]"
	case int:
		return strconv.Itoa(v)
	case int64:
		return strconv.FormatInt(v, 10)
	case float64:
		if v == float64(int(v)) {
			return strconv.Itoa(int(v))
		}
		return strconv.FormatFloat(v, 'f', -1, 64)
	case map[string]any:
		payload, _ := json.Marshal(v)
		return string(payload)
	default:
		return fmt.Sprint(v)
	}
}

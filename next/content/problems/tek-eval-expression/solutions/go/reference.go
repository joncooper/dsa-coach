package solution

func Evaluate(expr string) int {
	tokens := tokenize(expr)
	pos := 0
	var parseExpr func() int
	var parseTerm func() int
	var parseFactor func() int
	parseExpr = func() int {
		value := parseTerm()
		for pos < len(tokens) && (tokens[pos].op == "+" || tokens[pos].op == "-") {
			op := tokens[pos].op
			pos++
			rhs := parseTerm()
			if op == "+" {
				value += rhs
			} else {
				value -= rhs
			}
		}
		return value
	}
	parseTerm = func() int {
		value := parseFactor()
		for pos < len(tokens) && (tokens[pos].op == "*" || tokens[pos].op == "/") {
			op := tokens[pos].op
			pos++
			rhs := parseFactor()
			if op == "*" {
				value *= rhs
			} else {
				value = truncDiv(value, rhs)
			}
		}
		return value
	}
	parseFactor = func() int {
		if tokens[pos].op == "(" {
			pos++
			value := parseExpr()
			pos++
			return value
		}
		value := tokens[pos].num
		pos++
		return value
	}
	return parseExpr()
}

type token struct {
	num int
	op  string
}

func tokenize(expr string) []token {
	tokens := []token{}
	for i := 0; i < len(expr); {
		ch := expr[i]
		if ch == ' ' {
			i++
			continue
		}
		if ch >= '0' && ch <= '9' {
			value := 0
			for i < len(expr) && expr[i] >= '0' && expr[i] <= '9' {
				value = value*10 + int(expr[i]-'0')
				i++
			}
			tokens = append(tokens, token{num: value})
		} else {
			tokens = append(tokens, token{op: string(ch)})
			i++
		}
	}
	return tokens
}
func truncDiv(a, b int) int {
	q := abs(a) / abs(b)
	if (a < 0) == (b < 0) {
		return q
	}
	return -q
}
func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}

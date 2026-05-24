def evaluate(expr: str) -> int:
    tokens = []
    i = 0
    while i < len(expr):
        c = expr[i]
        if c == ' ':
            i += 1
        elif c.isdigit():
            j = i
            while j < len(expr) and expr[j].isdigit():
                j += 1
            tokens.append(int(expr[i:j]))
            i = j
        else:
            tokens.append(c)
            i += 1
    pos = 0
    def trunc_div(a, b):
        q = abs(a) // abs(b)
        return q if (a < 0) == (b < 0) else -q
    def parse_expr():
        nonlocal pos
        value = parse_term()
        while pos < len(tokens) and tokens[pos] in ('+', '-'):
            op = tokens[pos]; pos += 1
            rhs = parse_term()
            value = value + rhs if op == '+' else value - rhs
        return value
    def parse_term():
        nonlocal pos
        value = parse_factor()
        while pos < len(tokens) and tokens[pos] in ('*', '/'):
            op = tokens[pos]; pos += 1
            rhs = parse_factor()
            value = value * rhs if op == '*' else trunc_div(value, rhs)
        return value
    def parse_factor():
        nonlocal pos
        tok = tokens[pos]
        if tok == '(':
            pos += 1
            value = parse_expr()
            pos += 1
            return value
        pos += 1
        return tok
    return parse_expr()

export function evaluate(expr: string): number {
  const tokens: Array<number | string> = [];
  let cursor = 0;
  while (cursor < expr.length) {
    const ch = expr[cursor];
    if (ch === " ") { cursor += 1; continue; }
    if (/\d/.test(ch)) {
      let end = cursor;
      while (end < expr.length && /\d/.test(expr[end])) end += 1;
      tokens.push(Number(expr.slice(cursor, end)));
      cursor = end;
    } else { tokens.push(ch); cursor += 1; }
  }
  let pos = 0;
  const truncDiv = (a: number, b: number) => { const q = Math.trunc(Math.abs(a) / Math.abs(b)); return (a < 0) === (b < 0) ? q : -q; };
  const parseExpr = (): number => { let value = parseTerm(); while (pos < tokens.length && (tokens[pos] === "+" || tokens[pos] === "-")) { const op = tokens[pos++]; const rhs = parseTerm(); value = op === "+" ? value + rhs : value - rhs; } return value; };
  const parseTerm = (): number => { let value = parseFactor(); while (pos < tokens.length && (tokens[pos] === "*" || tokens[pos] === "/")) { const op = tokens[pos++]; const rhs = parseFactor(); value = op === "*" ? value * rhs : truncDiv(value, rhs); } return value; };
  const parseFactor = (): number => { const token = tokens[pos++]; if (token === "(") { const value = parseExpr(); pos += 1; return value; } return token as number; };
  return parseExpr();
}

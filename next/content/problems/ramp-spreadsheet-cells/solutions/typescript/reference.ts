const CELL_RE = /^[A-Z](?:[1-9][0-9]?|100)$/;

function isCell(term: string): boolean {
  return CELL_RE.test(term);
}

function toInt(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function spreadsheetCells(operations: string[][]): string[] {
  const cells = new Map<string, string>();
  const results: string[] = [];

  function refs(raw: string): string[] {
    if (!raw.startsWith("=")) return [];
    return raw.slice(1).split("+").filter(isCell);
  }

  function hasCycle(start: string): boolean {
    const visiting = new Set<string>();
    const visited = new Set<string>();

    function dfs(cell: string): boolean {
      if (visiting.has(cell)) return true;
      if (visited.has(cell)) return false;

      visiting.add(cell);
      for (const dep of refs(cells.get(cell) ?? "0")) {
        if (dfs(dep)) return true;
      }
      visiting.delete(cell);
      visited.add(cell);
      return false;
    }

    return dfs(start);
  }

  function evaluateCell(cell: string, visiting: Set<string>): [string, boolean] {
    if (visiting.has(cell)) return ["", true];

    const raw = cells.get(cell) ?? "0";
    if (!raw.startsWith("=")) return [raw, false];

    visiting.add(cell);
    let total = 0;
    for (const term of raw.slice(1).split("+")) {
      if (isCell(term)) {
        const [value, cycle] = evaluateCell(term, visiting);
        if (cycle) return ["", true];
        total += toInt(value);
      } else {
        total += toInt(term);
      }
    }
    visiting.delete(cell);
    return [String(total), false];
  }

  for (const op of operations) {
    if (op[0] === "SET") {
      const cell = op[1];
      const raw = op[2];
      const hadOld = cells.has(cell);
      const old = cells.get(cell);
      cells.set(cell, raw);

      if (raw.startsWith("=") && hasCycle(cell)) {
        if (hadOld) {
          cells.set(cell, old ?? "");
        } else {
          cells.delete(cell);
        }
        results.push("CYCLE");
      } else {
        results.push("");
      }
    } else {
      const [value, cycle] = evaluateCell(op[1], new Set<string>());
      results.push(cycle ? "CYCLE" : value);
    }
  }

  return results;
}

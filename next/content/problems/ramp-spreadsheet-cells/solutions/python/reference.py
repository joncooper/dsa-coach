import re


CELL_RE = re.compile(r"^[A-Z](?:[1-9][0-9]?|100)$")


def spreadsheet_cells(operations: list[list[str]]) -> list[str]:
    cells: dict[str, str] = {}
    results: list[str] = []

    def is_cell(term: str) -> bool:
        return CELL_RE.match(term) is not None

    def refs(raw: str) -> list[str]:
        if not raw.startswith("="):
            return []
        return [term for term in raw[1:].split("+") if is_cell(term)]

    def has_cycle(start: str) -> bool:
        visiting: set[str] = set()
        visited: set[str] = set()

        def dfs(cell: str) -> bool:
            if cell in visiting:
                return True
            if cell in visited:
                return False
            visiting.add(cell)
            for dep in refs(cells.get(cell, "0")):
                if dfs(dep):
                    return True
            visiting.remove(cell)
            visited.add(cell)
            return False

        return dfs(start)

    def to_int(value: str) -> int:
        try:
            return int(value)
        except ValueError:
            return 0

    def evaluate_cell(cell: str, visiting: set[str]) -> tuple[str, bool]:
        if cell in visiting:
            return "", True

        raw = cells.get(cell, "0")
        if not raw.startswith("="):
            return raw, False

        visiting.add(cell)
        total = 0
        for term in raw[1:].split("+"):
            if is_cell(term):
                value, cycle = evaluate_cell(term, visiting)
                if cycle:
                    return "", True
                total += to_int(value)
            else:
                total += to_int(term)
        visiting.remove(cell)
        return str(total), False

    for op in operations:
        if op[0] == "SET":
            cell, raw = op[1], op[2]
            old = cells.get(cell)
            had_old = cell in cells
            cells[cell] = raw

            if raw.startswith("=") and has_cycle(cell):
                if had_old:
                    cells[cell] = old or ""
                else:
                    del cells[cell]
                results.append("CYCLE")
            else:
                results.append("")
        else:
            value, cycle = evaluate_cell(op[1], set())
            results.append("CYCLE" if cycle else value)

    return results

def parse_csv_row(line: str) -> list[str]:
    fields = []
    current = []
    in_quotes = False
    i = 0
    while i < len(line):
        ch = line[i]
        if in_quotes:
            if ch == '"':
                if i + 1 < len(line) and line[i + 1] == '"':
                    current.append('"')
                    i += 2
                    continue
                in_quotes = False
                i += 1
                continue
            current.append(ch)
            i += 1
        else:
            if ch == '"' and not current:
                in_quotes = True
                i += 1
            elif ch == ',':
                fields.append(''.join(current))
                current = []
                i += 1
            else:
                current.append(ch)
                i += 1
    fields.append(''.join(current))
    return fields

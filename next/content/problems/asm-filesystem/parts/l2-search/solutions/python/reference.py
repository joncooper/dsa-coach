def solution(queries):
    files = {}
    out = []

    def render(matches):
        items = sorted(matches, key=lambda kv: (-kv[1], kv[0]))
        return ",".join(n + "(" + str(s) + ")" for n, s in items)

    for q in queries:
        op = q[0]
        if op == "ADD_FILE":
            name, size = q[1], int(q[2])
            if name in files:
                out.append("false")
            else:
                files[name] = size
                out.append("true")
        elif op == "GET_FILE_SIZE":
            name = q[1]
            out.append(str(files[name]) if name in files else "")
        elif op == "COPY_FILE":
            src, dst = q[1], q[2]
            if src not in files:
                out.append("false")
            else:
                files[dst] = files[src]
                out.append("true")
        elif op == "FIND_BY_PREFIX":
            prefix = q[1]
            out.append(render([(n, s) for n, s in files.items() if n.startswith(prefix)]))
        elif op == "FIND_BY_SUFFIX":
            suffix = q[1]
            out.append(render([(n, s) for n, s in files.items() if n.endswith(suffix)]))
        else:
            out.append("")
    return out

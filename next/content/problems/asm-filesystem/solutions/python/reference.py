def solution(queries):
    files = {}
    out = []
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
        else:
            out.append("")
    return out
